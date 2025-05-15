from flask import Flask, request, jsonify
from flask_cors import CORS
from send import send_whatsapp_message

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/send-whatsapp', methods=['POST'])
def send_whatsapp():
    try:
        data = request.get_json()
        
        # Get message content and recipient number from request
        message = data.get('message')
        recipient = data.get('recipient', '+34657126472')  # Default to your previous number if not provided
        
        if not message:
            return jsonify({"status": "error", "message": "Message content is required"}), 400
            
        # Send the WhatsApp message
        message_sid = send_whatsapp_message(
            to_number=recipient,
            message_body=message
        )
        
        if message_sid:
            return jsonify({
                "status": "success",
                "message": "WhatsApp message sent successfully!",
                "sid": message_sid
            })
        else:
            return jsonify({"status": "error", "message": "Failed to send WhatsApp message"}), 500
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080) 