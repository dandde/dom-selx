#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    # Kill all child processes of the current shell (which includes the background jobs)
    pkill -P $$
    exit
}

check_port() {
    local port=$1
    if lsof -i :$port -t >/dev/null 2>&1; then
        echo "❌ Port $port is already in use by process $(lsof -i :$port -t | head -n 1)."
        return 1
    fi
    return 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM to run cleanup
trap cleanup SIGINT SIGTERM

echo "🚀 Starting development environment..."

# Pre-flight checks
if ! check_port 3001; then
    echo "⚠️  Port 3001 (Rust Proxy) is occupied."
    echo "   Please stop the existing process or run: lsof -i :3001 | awk 'NR!=1 {print \$2}' | xargs kill"
    exit 1
fi

if ! check_port 5173; then
    echo "⚠️  Port 5173 (Frontend) is occupied."
    echo "   Please stop the existing process or run: lsof -i :5173 | awk 'NR!=1 {print \$2}' | xargs kill"
    exit 1
fi

# Start Backend
echo "📦 Starting slex-proxy (Rust)..."
(cd slex-proxy && cargo run) &
PROXY_PID=$!

# Start Frontend
echo "⚛️ Starting slex-frontend (React)..."
(cd slex-frontend && npm run dev) &
FRONTEND_PID=$!

# Wait for servers to potentially be ready
echo "⏳ Waiting for servers to initialize..."
sleep 5

# Open the app
echo "🌍 Opening http://localhost:5173"
# 'open' is specific to macOS, 'xdg-open' for Linux if needed later
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:5173"
else
    echo "Please open http://localhost:5173 in your browser."
fi

echo "✅ Environment running. Press Ctrl+C to stop."

# Wait for both processes to keep the script running
wait $PROXY_PID $FRONTEND_PID
