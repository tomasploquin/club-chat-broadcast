from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sys

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
    def mcp_send_message(recipient, message):
        print(f"[MCP DUMMY] Send message to {recipient}: {message}")
        return True, "Message sent (dummy)"
    def mcp_send_file(recipient, file_path):
        print(f"[MCP DUMMY] Send file to {recipient}: {file_path}")
        return True, "File sent (dummy)"

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
        message_text = request.form.get('message') # Renamed to avoid conflict with mcp_send_message variable
        recipients_json = request.form.get('recipients')
        file_obj = request.files.get('file') # Renamed to avoid conflict

        if not message_text or not recipients_json:
            return jsonify({"status": "error", "message": "Message and recipients are required"}), 400

        try:
            recipients = json.loads(recipients_json)
        except json.JSONDecodeError as e:
            return jsonify({"status": "error", "message": f"Invalid recipients JSON format: {str(e)}"}), 400
        
        if not isinstance(recipients, list) or not all(isinstance(r, str) for r in recipients):
            return jsonify({"status": "error", "message": "Recipients should be a list of strings (JIDs)"}), 400

        print("Processing message:", message_text)
        print("Processing for recipients:", recipients)

        saved_file_path = None
        absolute_saved_file_path = None # Variable for absolute path
        if file_obj:
            filename = file_obj.filename # Consider using secure_filename from werkzeug.utils
            saved_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            absolute_saved_file_path = os.path.abspath(saved_file_path) # Get absolute path
            file_obj.save(saved_file_path) # Save with relative or absolute, os.path.abspath works on existing/non-existing
            print("File saved to (relative):", saved_file_path)
            print("File saved to (absolute):", absolute_saved_file_path)
        
        results = []
        for recipient_jid in recipients:
            print(f"Attempting to send to: {recipient_jid}")
            # Send text message
            success, status_msg = mcp_send_message(recipient_jid, message_text)
            results.append({"recipient": recipient_jid, "text_status": status_msg, "text_success": success})
            print(f"Text send status for {recipient_jid}: {status_msg}")

            # Send file if exists, using the absolute path
            if absolute_saved_file_path and success: # Optionally, only send file if text was successful
                file_success, file_status_msg = mcp_send_file(recipient_jid, absolute_saved_file_path)
                results[-1].update({"file_status": file_status_msg, "file_success": file_success})
                print(f"File send status for {recipient_jid}: {file_status_msg}")
            elif absolute_saved_file_path:
                results[-1].update({"file_status": "Text message failed, file not sent", "file_success": False})

        # Clean up uploaded file after sending to all recipients
        if saved_file_path and os.path.exists(saved_file_path): # Check existence with original path used for saving
            try:
                os.remove(saved_file_path)
                print(f"Cleaned up uploaded file: {saved_file_path}")
            except OSError as e:
                print(f"Error deleting uploaded file {saved_file_path}: {e}")

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