#!/bin/bash

echo "Attempting to kill all kubectl port-forward processes..."

# Find PIDs of kubectl port-forward processes and kill them
PIDS=$(pgrep -f "kubectl port-forward")

if [ -z "$PIDS" ]; then
    echo "No kubectl port-forward processes found running."
else
    echo "Found PIDS: $PIDS. Killing processes..."
    kill "$PIDS"
    echo "Killed kubectl port-forward processes."
fi

echo "Cleanup complete."
