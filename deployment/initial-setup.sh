#!/usr/bin/env bash
set -e

echo "=========================================="
echo "Bazarlar Online Initial Setup"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script with sudo"
    exit 1
fi

# 1. Update system packages
echo ""
echo "1. Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# 2. Install essential packages
echo ""
echo "2. Installing essential packages..."
apt install -y \
    git \
    curl \
    wget \
    build-essential \
    software-properties-common \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx
print_success "Essential packages installed"

# 3. Install Python 3.11+
echo ""
echo "3. Installing Python 3.11..."
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
print_success "Python 3.11 installed"

# 4. Install Node.js 18.x
echo ""
echo "4. Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
print_success "Node.js installed: $(node --version)"

# 5. Install PostgreSQL
echo ""
echo "5. Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
print_success "PostgreSQL installed"

# 6. Install Redis
echo ""
echo "6. Installing Redis..."
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
print_success "Redis installed"

# 7. Install and configure Nginx
echo ""
echo "7. Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installed"

# 8. Configure firewall
echo ""
echo "8. Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
print_success "Firewall configured"

# 9. Create application user and directories
echo ""
echo "9. Creating application directories..."
mkdir -p /var/www/bazarlaronline
mkdir -p /var/www/bazarlaronline/backend
mkdir -p /var/www/bazarlaronline/frontend_dist
mkdir -p /var/www/bazarlaronline/uploads
mkdir -p /var/www/bazarlaronline/logs
print_success "Directories created"

# 10. Set proper permissions
echo ""
echo "10. Setting permissions..."
chown -R www-data:www-data /var/www/bazarlaronline
chmod -R 755 /var/www/bazarlaronline
chmod -R 775 /var/www/bazarlaronline/uploads
print_success "Permissions set"

echo ""
echo "=========================================="
print_success "Initial setup completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure PostgreSQL database"
echo "2. Clone your repository to /var/www/bazarlaronline"
echo "3. Set up .env file with production credentials"
echo "4. Install Python dependencies"
echo "5. Build and deploy frontend"
echo "6. Configure nginx and systemd services"
echo "7. Obtain SSL certificate"
echo ""
echo "Refer to DEPLOYMENT.md for detailed instructions"
echo ""
