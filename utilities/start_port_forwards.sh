#!/bin/bash

# Define services and their corresponding local and remote ports using indexed arrays
service_names=(
    "adservice"
    "cartservice"
    "checkoutservice"
    "currencyservice"
    "emailservice"
    "paymentservice"
    "productcatalogservice"
    "recommendationservice"
    "shippingservice"
)

service_ports=(
    "9555:9555"
    "7070:7070"
    "5050:5050"
    "7000:7000"
    "5000:5000"
    "50051:50051"
    "3550:3550"
    "8080:8080"
    "50052:50051" # Using local port 50052 to avoid conflict with paymentservice
)

echo "Starting Kubernetes port-forwards for Hipster Shop microservices..."

PIDS=()
for i in "${!service_names[@]}"; do
    svc_name="${service_names[$i]}"
    ports="${service_ports[$i]}"
    echo "Forwarding service ${svc_name} ports ${ports} in the background..."
    kubectl port-forward "svc/${svc_name}" "${ports}" > /dev/null 2>&1 &
    PIDS+=($!) # Store PID to manage later
done

echo "All port-forwarding commands have been started in the background."
echo "To check active port-forwards, use 'jobs' or 'lsof -i -P -n | grep LISTEN'."
echo "To stop all port-forwards, run 'kill $(jobs -p)' if in the same shell, or find and kill the respective 'kubectl port-forward' processes."

echo ""
echo "IMPORTANT: I have assigned shippingservice to local port 50052 to avoid a conflict with paymentservice."
echo "You have already updated your agent.py file to reflect this change for the shippingservice client."
