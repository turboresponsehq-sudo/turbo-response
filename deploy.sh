#!/bin/bash

# Turbo Response Platform - Deployment Script
# This script helps deploy the platform to various hosting providers

set -e

echo "🚀 Turbo Response Platform - Deployment Script"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
    echo ""
fi

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    echo ""
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ docker-compose is not installed. Please install docker-compose first."
        exit 1
    fi
    
    echo "Building Docker images..."
    docker-compose build
    
    echo "Starting containers..."
    docker-compose up -d
    
    echo ""
    echo "✅ Deployment complete!"
    echo "Platform is running at: http://localhost:5000"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
}

# Function to deploy with systemd
deploy_systemd() {
    echo "⚙️  Deploying with systemd..."
    echo ""
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip3 install -r requirements-production.txt
    
    # Create systemd service file
    cat > /tmp/turbo-response.service << EOF
[Unit]
Description=Turbo Response Platform
After=network.target

[Service]
Type=notify
User=$USER
WorkingDirectory=$(pwd)
Environment="PATH=$(pwd)/venv/bin"
ExecStart=$(pwd)/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 src.main:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    
    echo "Installing systemd service..."
    sudo mv /tmp/turbo-response.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable turbo-response
    sudo systemctl start turbo-response
    
    echo ""
    echo "✅ Deployment complete!"
    echo "Platform is running at: http://localhost:5000"
    echo ""
    echo "To view status: sudo systemctl status turbo-response"
    echo "To view logs: sudo journalctl -u turbo-response -f"
}

# Function to create deployment package
create_package() {
    echo "📦 Creating deployment package..."
    echo ""
    
    PACKAGE_NAME="turbo-response-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    tar -czf "$PACKAGE_NAME" \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='.git' \
        --exclude='*.db' \
        --exclude='.env' \
        .
    
    echo "✅ Package created: $PACKAGE_NAME"
    echo ""
    echo "Upload this package to your server and extract it:"
    echo "  tar -xzf $PACKAGE_NAME"
    echo "  cd turbo-response-backend"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your values"
    echo "  pip install -r requirements-production.txt"
    echo "  gunicorn --bind 0.0.0.0:5000 --workers 4 src.main:app"
}

# Main menu
echo "Choose deployment method:"
echo "1) Docker (recommended)"
echo "2) Systemd service"
echo "3) Create deployment package"
echo "4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        deploy_docker
        ;;
    2)
        deploy_systemd
        ;;
    3)
        create_package
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

