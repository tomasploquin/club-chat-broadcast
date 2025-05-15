#!/usr/bin/env python3

from twilio.rest import Client

# Your Twilio account SID and Auth Token
account_sid = 'AC3cc95ce7fa1967142124fff0767f990d'
auth_token = '09a977df966c818b5fd572088a1b7092'
client = Client(account_sid, auth_token)

def send_whatsapp_message(to_number, message_body):
    """
    Send a WhatsApp message using Twilio.
    
    Args:
        to_number (str): The recipient's phone number in E.164 format with WhatsApp prefix
                        (e.g., 'whatsapp:+1XXXXXXXXXX')
        message_body (str): The content of the WhatsApp message
    
    Returns:
        The message SID if successful
    """
    try:
        # For WhatsApp, the from number must be in the format: 'whatsapp:+1XXXXXXXXXX'
        # and must be your Twilio WhatsApp-enabled number or sandbox number
        from_whatsapp_number = 'whatsapp:+14155238886'  # Twilio sandbox number
        
        # Format recipient's number if it doesn't have WhatsApp prefix
        if not to_number.startswith('whatsapp:'):
            to_whatsapp_number = f'whatsapp:{to_number}'
        else:
            to_whatsapp_number = to_number
            
        message = client.messages.create(
            body=message_body,
            from_=from_whatsapp_number,
            to=to_whatsapp_number
        )
        print(f"WhatsApp message sent! SID: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"Error sending WhatsApp message: {e}")
        return None

if __name__ == "__main__":
    # Example usage for WhatsApp
    send_whatsapp_message(
        to_number="+34625863601",  # Recipient's phone number
        message_body="Ay mario soy jomo y eres un maldito gay"
    ) 