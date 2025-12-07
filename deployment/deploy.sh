#!/bin/bash

# ============================================
# Bazarlar Online Deployment Script
# ============================================
# This script updates and restarts the application
# Run this script after initial setup to deploy updates

set -e  # Exit on any error

echo "=========================================="
echo "Bazarlar Online Deployment Started"
echo "=========================================="

# Configuration
PROJECT_DIR="/var/www/bazarlaronline"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$PROJECT_DIR/venv"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script with sudo"
    exit 1
fi

# 1. Pull latest code
echo ""
echo "1. Pulling latest code from repository..."
cd $PROJECT_DIR
git pull origin main || git pull origin master
print_success "Code updated"

# 2. Update backend dependencies
echo ""
echo "2. Updating backend dependencies..."
cd $BACKEND_DIR
source $VENV_DIR/bin/activate
pip install -r requirements.txt --upgrade
print_success "Backend dependencies updated"

# 3. Run database migrations
echo ""
echo "3. Running database migrations..."
cd $BACKEND_DIR
for migration_file in migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        print_warning "Found migration: $migration_file"
        echo "Please run migrations manually if needed"
    fi
done
print_success "Migration check completed"

# 4. Build frontend
echo ""
echo "4. Building frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# Copy build to deployment directory
rm -rf /var/www/bazarlaronline/frontend_dist/*
cp -r build/* /var/www/bazarlaronline/frontend_dist/
print_success "Frontend built and deployed"

# 5. Restart backend services
echo ""
echo "5. Restarting backend services..."
systemctl restart bazarlar-api
systemctl restart bazarlar-celery
print_success "Backend services restarted"

# 6. Reload nginx
echo ""
echo "6. Reloading nginx..."
nginx -t && systemctl reload nginx
print_success "Nginx reloaded"

# 7. Check service status
echo ""
echo "7. Checking service status..."
echo ""
echo "API Service:"
systemctl status bazarlar-api --no-pager -l | head -n 10
echo ""
echo "Celery Service:"
systemctl status bazarlar-celery --no-pager -l | head -n 10
echo ""
echo "Nginx Service:"
systemctl status nginx --no-pager -l | head -n 10

echo ""
echo "=========================================="
print_success "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check application logs: journalctl -u bazarlar-api -f"
echo "2. Check celery logs: journalctl -u bazarlar-celery -f"
echo "3. Check nginx logs: tail -f /var/log/nginx/error.log"
echo ""
