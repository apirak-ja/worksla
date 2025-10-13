#!/usr/bin/env bash
# Run work_improved.py in an infinite loop, log output, and save PID
LOG_FILE="work_improved.log"
PID_FILE="work_improved.pid"

# ensure logs directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Start loop in background
(
  while true; do
    echo "--- START RUN $(date +'%Y-%m-%d %H:%M:%S') ---" >> "$LOG_FILE"
    python3 work_improved.py >> "$LOG_FILE" 2>&1
    echo "--- END RUN $(date +'%Y-%m-%d %H:%M:%S') ---" >> "$LOG_FILE"
    sleep 30
  done
) &

# Save PID
echo $! > "$PID_FILE"

echo "Started continuous run. PID=$(cat $PID_FILE), log=$LOG_FILE"
