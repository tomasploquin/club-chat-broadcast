import requests
import json

def test_whatsapp_api():
    # API endpoint
    url = "http://localhost:8080/api/send-whatsapp"
    
    # Test message data
    payload = {
        "message": "This is a test message from API test script",
        "recipient": "+34657126472"  # Replace with your actual test number
    }
    
    # Send POST request to the API
    print("Sending test request to WhatsApp API...")
    response = requests.post(url, json=payload)
    
    # Print response details
    print(f"Status Code: {response.status_code}")
    
    try:
        response_data = response.json()
        print("Response:")
        print(json.dumps(response_data, indent=2))
        
        if response.status_code == 200 and response_data.get("status") == "success":
            print("\n✅ SUCCESS: WhatsApp message was sent successfully!")
            print(f"Message SID: {response_data.get('sid')}")
        else:
            print("\n❌ ERROR: Failed to send WhatsApp message.")
            print(f"Error message: {response_data.get('message')}")
    except Exception as e:
        print(f"\n❌ ERROR parsing response: {e}")

if __name__ == "__main__":
    test_whatsapp_api() 