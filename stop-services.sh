#!/bin/bash

export PATH=$PATH:/usr/sbin:/sbin

PORTS=(3000 3001 5173 5432)

echo "Checking for processes running on HydroFlow ports: ${PORTS[*]}"

for port in "${PORTS[@]}"; do
  PIDS=$(lsof -nP -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null)
  
  if [ -n "$PIDS" ]; then
    echo "➡️ Found process(es) listening on port $port: $PIDS"
    for pid in $PIDS; do
      echo "  Killing PID $pid..."
      kill -9 "$pid" 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "  ✅ Successfully killed PID $pid"
      else
        echo "  ❌ Failed to kill PID $pid (might require sudo)"
      fi
    done
  else
    echo "✅ Port $port is free."
  fi
done

echo ""
echo "Orphaned services have been stopped. You can now start the project again."
