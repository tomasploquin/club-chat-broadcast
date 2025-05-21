import csv
import os
import argparse
from whatsapp import send_message, send_file

# Path to the CSV file
csv_file_path = 'Test Dataset - Sheet1.csv'

# Path to the file to send
file_to_send = '/Users/marioguraieb/Desktop/whatsapp-mcp/example-use.png'

# CLI argument parsing for message template
def get_message_template():
    parser = argparse.ArgumentParser(description="Send WhatsApp messages with dynamic content.")
    parser.add_argument('--message', type=str, help='Message template, e.g. "Hello {first_text}!"')
    args = parser.parse_args()
    if args.message:
        return args.message
    else:
        return input("Enter your message template (e.g. 'Hello {first_text}!'): ")

message_template = get_message_template()

# Read the CSV file
with open(csv_file_path, mode='r') as file:
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        # Extract name
        nickname = row['first_text']

        # Extract phone number and indicatif (country code)
        phone_number = row['whatapp_phone_number_text']
        indicatif = row['indicatif_phone_text']

        # Clean up phone number (remove spaces, dashes, etc.)
        clean_number = ''.join(filter(str.isdigit, phone_number))

        # Combine indicatif and phone number
        full_number = f"{indicatif}{clean_number}"

        # Construct the recipient JID
        recipient_jid = f'{full_number}@s.whatsapp.net'

        # Format the message with dynamic variables from the row
        try:
            message = message_template.format(**row)
        except KeyError as e:
            print(f"Missing column in CSV for message template: {e}")
            continue

        # Send the message
        send_message(recipient_jid, message)

        # Send the file
        send_file(recipient_jid, file_to_send)

        print(f'Message and file sent to {nickname} ({phone_number})') 