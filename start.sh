#!/bin/bash

# Portfolio Calculator Startup Script

echo "🚀 Starting Portfolio Calculator..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python 3 is available
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is available
if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if npm is available
if ! command_exists npm; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start backend
echo "🔧 Starting backend server..."
cd backend

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt is newer than last install
if [ requirements.txt -nt venv/pyvenv.cfg ] || [ ! -f venv/pyvenv.cfg ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start backend in background
echo "🚀 Starting FastAPI backend on http://localhost:8000"
uvicorn app:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd ../frontend

# Install dependencies if package.json is newer than node_modules
if [ package.json -nt node_modules/.package-lock.json ] || [ ! -d node_modules ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Starting React frontend on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Portfolio Calculator is starting up!"
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "🎨 Frontend: http://localhost:5173"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
