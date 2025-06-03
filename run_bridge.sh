#!/bin/bash
MAX_RESTARTS=5 # Set a limit to prevent infinite loops if there's a persistent crash
RESTART_COUNT=0
BRIDGE_DIR="MCP/whatsapp-bridge" # Path relative to the script location (project root)
DB_FILE="$BRIDGE_DIR/store/whatsapp.db"

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    echo "Starting WhatsApp Bridge (Attempt: $((RESTART_COUNT + 1)) of $MAX_RESTARTS)..."
    
    # Ensure a fresh session by removing the old database file
    if [ -f "$DB_FILE" ]; then
        echo "Removing existing session file: $DB_FILE"
        rm "$DB_FILE"
        if [ $? -ne 0 ]; then
            echo "Warning: Could not remove $DB_FILE. Proceeding anyway."
        fi
    else
        echo "No existing session file ($DB_FILE) found."
    fi

    # Navigate to the bridge directory
    cd "$BRIDGE_DIR"
    if [ $? -ne 0 ]; then
        echo "Error: Could not navigate to $BRIDGE_DIR. Please check the path."
        exit 1
    fi

    # Run the Go application
    go run main.go

    EXIT_CODE=$?
    echo "WhatsApp Bridge exited with code $EXIT_CODE."

    if [ $EXIT_CODE -eq 0 ]; then
        echo "WhatsApp Bridge exited normally (code 0). Not restarting."
        break 
    fi

    RESTART_COUNT=$((RESTART_COUNT + 1))
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        echo "Max restarts reached. WhatsApp Bridge will not be automatically restarted again."
        break
    fi

    echo "Restarting WhatsApp Bridge in 5 seconds..."
    sleep 5
done

echo "run_bridge.sh script finished." 