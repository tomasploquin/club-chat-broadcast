from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sys
import queue
import threading
import time
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

# Global message queue
message_queue = queue.Queue()

# Worker function to process messages from the queue
def process_message_queue():
    while True:
        try:
            task = message_queue.get()
            task_type = task.get("type")

            if task_type == 'send_message':
                recipient_jid = task['recipient_jid']
                first_text = task['first_text']
                base_message_body = task['base_message_body']
                absolute_saved_file_path = task.get('file_path')

                personalized_message = f"Dear {first_text},\\n{base_message_body}"
                
                print(f"Worker: Processing message for {recipient_jid}")
                print(f"Worker: Message content:\\n{personalized_message}")


                if absolute_saved_file_path:
                    print(f"Worker: Attempting to send file {absolute_saved_file_path} to {recipient_jid}")
                    file_success, file_status_msg = mcp_send_file(recipient_jid, absolute_saved_file_path)
                    print(f"Worker: File send status for {recipient_jid}: {file_status_msg} (Success: {file_success})")
                
                print(f"Worker: Attempting to send text message to {recipient_jid}")
                text_success, text_status_msg = mcp_send_message(recipient_jid, personalized_message)
                print(f"Worker: Text send status for {recipient_jid}: {text_status_msg} (Success: {text_success})")
                
                # Introduce a delay to avoid rate limiting
                time.sleep(5) # Adjust delay as needed

            elif task_type == 'cleanup_file':
                file_path_to_delete = task.get('file_path')
                if file_path_to_delete and os.path.exists(file_path_to_delete):
                    try:
                        os.remove(file_path_to_delete)
                        print(f"Worker: Cleaned up uploaded file: {file_path_to_delete}")
                    except OSError as e:
                        print(f"Worker: Error deleting file {file_path_to_delete}: {e}")
                else:
                    print(f"Worker: Cleanup task - file not found or path not provided: {file_path_to_delete}")
            
            else:
                print(f"Worker: Unknown task type received: {task_type}")

        except Exception as e:
            print(f"Worker: Error processing task: {e}")
            import traceback
            traceback.print_exc()
        finally:
            if 'task' in locals() and task is not None : #Ensure task was pulled
                 message_queue.task_done()

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
        
        # Enqueue tasks for each recipient
        for recipient_info in recipients_data:
            task = {
                "type": "send_message",
                "recipient_jid": recipient_info['jid'],
                "first_text": recipient_info['first_text'],
                "base_message_body": base_message_body,
                "file_path": absolute_saved_file_path # This will be None if no file
            }
            message_queue.put(task)
            print(f"Enqueued message for {recipient_info['jid']}")

        # If a file was uploaded, enqueue a cleanup task for it
        if absolute_saved_file_path:
            cleanup_task = {
                "type": "cleanup_file",
                "file_path": absolute_saved_file_path
            }
            message_queue.put(cleanup_task)
            print(f"Enqueued cleanup task for file: {absolute_saved_file_path}")

        return jsonify({
            "status": "success", 
            "message": f"{len(recipients_data)} messages have been queued for sending."
        })

    except Exception as e:
        print(f"Error in /api/send-message-to-selected: {str(e)}")
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Start the worker thread
    worker_thread = threading.Thread(target=process_message_queue, daemon=True)
    worker_thread.start()
    print("Message processing worker thread started.")
    app.run(debug=True, port=5001) 