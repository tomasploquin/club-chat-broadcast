# WhatsApp Bulk Message Sender (MCP Version)

This script allows you to send the same message and file to multiple WhatsApp contacts automatically using the WhatsApp MCP (Model Context Protocol) server.

## Prerequisites

- Python 3.7 or higher
- Active WhatsApp account
- WhatsApp MCP server running
- Internet connection

## Setup

1. First, make sure you have the WhatsApp MCP server running. Follow the MCP server setup instructions in its documentation.

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Prepare your contacts list:
   - Edit the `contacts.csv` file
   - Add one contact name per line in the 'contact' column
   - Make sure the contact names match exactly as they appear in your WhatsApp

4. Prepare your file:
   - Place the file you want to send in the project directory
   - Update the `file_path` variable in `whatsapp_mcp_sender.py` with your file name

5. Customize your message:
   - Edit the `message` variable in `whatsapp_mcp_sender.py` with your desired message

## Usage

1. Make sure the WhatsApp MCP server is running and connected to your WhatsApp account

2. Run the script:
```bash
python whatsapp_mcp_sender.py
```

3. The script will:
   - Read contacts from the CSV file
   - For each contact:
     - Search for their phone number/JID
     - Send the specified file
     - Send the message
   - Show progress in the terminal
   - Display a summary of successful and failed attempts

## Important Notes

- The script includes delays between messages to avoid rate limiting
- Make sure your WhatsApp MCP server remains connected
- Ensure all contacts are saved in your phone's WhatsApp
- The script uses contact names exactly as they appear in WhatsApp

## Troubleshooting

If you encounter issues:
- Verify your contacts are saved correctly in your phone
- Check your internet connection
- Ensure the WhatsApp MCP server is running and connected
- Verify the file path is correct
- Check the MCP server logs for any errors
