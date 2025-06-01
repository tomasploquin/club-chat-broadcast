from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sys
import requests

# Add MCP server directory to Python path to allow imports
# Assuming app.py is in the root and MCP is a subdirectory
mcp_server_path = os.path.join(os.path.dirname(__file__), 'MCP', 'whatsapp-mcp-server')
if mcp_server_path not in sys.path:
    sys.path.append(mcp_server_path)

# Now try to import from whatsapp.py
try:
    from whatsapp import send_message as mcp_send_message, send_file as mcp_send_file
except ImportError as e:
    print(f"Could not import from MCP whatsapp.py: {e}")
    # Define dummy functions if import fails, so app can still run for testing other parts
    def mcp_send_file(recipient, file_path):
        print(f"[MCP DUMMY] Send file to {recipient}: {file_path}")
        return True, "File sent (dummy)"
    def mcp_send_message(recipient, message):
        print(f"[MCP DUMMY] Send message to {recipient}: {message}")
        return True, "Message sent (dummy)"
    

app = Flask(__name__)
CORS(app)

# Define the Go WhatsApp Bridge base URL
# IMPORTANT: Ensure this matches the actual address and port of your Go bridge's HTTP server
GO_BRIDGE_BASE_URL = "http://localhost:8082" 

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/whatsapp/status', methods=['GET'])
def get_whatsapp_status():
    try:
        response = requests.get(f"{GO_BRIDGE_BASE_URL}/status", timeout=5)
        response.raise_for_status()  # Raises an exception for 4XX/5XX errors
        
        content_type = response.headers.get('Content-Type', '')
        if 'application/json' in content_type:
            return jsonify(response.json()), response.status_code
        else:
            print(f"Error: Go bridge /status did not return JSON. Content-Type: {content_type}")
            print(f"Response text from Go bridge /status: {response.text[:500]}...") # Log first 500 chars
            return jsonify({"status": "error", "message": "WhatsApp bridge returned non-JSON response for status.", "details": "Check Flask console logs."}), 502
            
    except requests.exceptions.RequestException as e:
        print(f"Error calling Go bridge /status: {e}")
        return jsonify({"status": "error", "message": "Could not connect to WhatsApp bridge", "details": str(e)}), 503
    except Exception as e:
        print(f"Unexpected error in /api/whatsapp/status: {e}")
        return jsonify({"status": "error", "message": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/api/whatsapp/qr', methods=['GET'])
def get_whatsapp_qr():
    try:
        response = requests.get(f"{GO_BRIDGE_BASE_URL}/qr", timeout=15) # Longer timeout for QR code
        response.raise_for_status()

        content_type = response.headers.get('Content-Type', '')
        if 'application/json' in content_type:
            return jsonify(response.json()), response.status_code
        else:
            print(f"Error: Go bridge /qr did not return JSON. Content-Type: {content_type}")
            print(f"Response text from Go bridge /qr: {response.text[:500]}...") # Log first 500 chars
            return jsonify({"status": "error", "message": "WhatsApp bridge returned non-JSON response for QR.", "details": "Check Flask console logs."}), 502

    except requests.exceptions.RequestException as e:
        print(f"Error calling Go bridge /qr: {e}")
        return jsonify({"status": "error", "message": "Could not connect to WhatsApp bridge to get QR code", "details": str(e)}), 503
    except Exception as e:
        print(f"Unexpected error in /api/whatsapp/qr: {e}")
        return jsonify({"status": "error", "message": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/api/send-whatsapp', methods=['POST'])
def send_whatsapp():
    # This route seems to be from an older setup, 
    # ensure it uses mcp_send_message if it's still needed
    # For now, focusing on send_message_to_selected
    try:
        data = request.get_json()
        message = data.get('message')
        recipient = data.get('recipient', '+34657126472')
        if not message:
            return jsonify({"status": "error", "message": "Message content is required"}), 400
        
        # Decide if this recipient needs JID formatting like in the other route
        # Assuming it might be a raw number here based on original code
        success, status_msg = mcp_send_message(recipient, message)
        
        if success:
            return jsonify({"status": "success", "message": status_msg, "sid": "MCP_SID_Placeholder"})
        else:
            return jsonify({"status": "error", "message": status_msg}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/send-message-to-selected', methods=['POST'])
def send_message_to_selected():
    try:
        base_message_body = request.form.get('message') 
        recipients_data_json = request.form.get('recipients_data') # Changed from 'recipients'
        file_obj = request.files.get('file')

        if not base_message_body or not recipients_data_json:
            return jsonify({"status": "error", "message": "Message and recipients_data are required"}), 400

        try:
            recipients_data = json.loads(recipients_data_json)
        except json.JSONDecodeError as e:
            return jsonify({"status": "error", "message": f"Invalid recipients_data JSON format: {str(e)}"}), 400
        
        # Validate structure of recipients_data (list of objects with jid and first_text)
        if not isinstance(recipients_data, list) or \
           not all(isinstance(r, dict) and 'jid' in r and 'first_text' in r for r in recipients_data):
            return jsonify({"status": "error", "message": "recipients_data should be a list of objects, each with 'jid' and 'first_text'"}), 400

        print("Base message body:", base_message_body)
        print("Processing for recipients data:", recipients_data)

        absolute_saved_file_path = None
        if file_obj:
            filename = file_obj.filename
            saved_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            absolute_saved_file_path = os.path.abspath(saved_file_path)
            file_obj.save(saved_file_path)
            print("File saved (absolute):", absolute_saved_file_path)
        
        results = []
        for recipient_info in recipients_data:
            recipient_jid = recipient_info['jid']
            first_text = recipient_info['first_text']

            # Construct personalized message
            personalized_message = f"Dear {first_text},\n{base_message_body}"

            print(f"Attempting to send to: {recipient_jid} with message:\n{personalized_message}")
            
            file_sent_successfully = False
            current_result = {"recipient": recipient_jid} 

            if absolute_saved_file_path:
                file_success, file_status_msg = mcp_send_file(recipient_jid, absolute_saved_file_path)
                current_result.update({"file_status": file_status_msg, "file_success": file_success})
                file_sent_successfully = file_success
                print(f"File send status for {recipient_jid}: {file_status_msg}")
            
            text_success, text_status_msg = mcp_send_message(recipient_jid, personalized_message)
            current_result.update({"text_status": text_status_msg, "text_success": text_success})
            print(f"Text send status for {recipient_jid}: {text_status_msg}")
            
            results.append(current_result)

        if absolute_saved_file_path and os.path.exists(absolute_saved_file_path):
            try:
                os.remove(absolute_saved_file_path) # Use absolute for removal too
                print(f"Cleaned up uploaded file: {absolute_saved_file_path}")
            except OSError as e:
                print(f"Error deleting file {absolute_saved_file_path}: {e}")

        return jsonify({
            "status": "success", 
            "message": "Messages processed.",
            "results": results
        })

    except Exception as e:
        print(f"Error in /api/send-message-to-selected: {str(e)}")
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 