#!/bin/bash

# run.sh - Quickstart script for Nagpur Traffic AI
# Usage: ./run.sh [backend|frontend]

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: ./run.sh [backend|frontend]"
    exit 1
fi

if [ "$SERVICE" = "backend" ]; then
    echo "Starting backend development server..."
    cd backend
    
    # Check if uv is installed
    if ! command -v uv &> /dev/null; then
        echo "Installing uv..."
        pip install uv
    fi
    
    if [ ! -f ".env" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    fi
    
    # Create virtual environment with python 3.11
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment with python 3.11..."
        uv venv .venv --python 3.11
    fi
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Install dependencies
    echo "Installing backend dependencies..."
    uv pip install -r requirements.txt
    
    # Run server
    echo "Running FastAPI server..."
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

elif [ "$SERVICE" = "frontend" ]; then
    echo "Starting frontend development server..."
    cd frontend
    
    # Check if node_modules exists, install if not
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    # Run dev server
    echo "Running Vite server..."
    npm run dev

else
    echo "Invalid argument. Use 'backend' or 'frontend'."
    exit 1
fi
