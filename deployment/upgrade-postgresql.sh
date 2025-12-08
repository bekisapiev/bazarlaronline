#!/usr/bin/env bash
set -e

echo "=========================================="
echo "PostgreSQL Version Upgrade Script"
echo "Remove PostgreSQL 16 and Install PostgreSQL 18"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

echo ""
print_warning "This script will:"
print_warning "1. Stop PostgreSQL 16"
print_warning "2. Backup existing databases (optional)"
print_warning "3. Remove PostgreSQL 16"
print_warning "4. Install PostgreSQL 17"
print_warning ""
read -p "Do you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Aborted."
    exit 1
fi

# 1. Stop PostgreSQL
echo ""
echo "1. Stopping PostgreSQL service..."
systemctl stop postgresql || true
print_success "PostgreSQL stopped"

# 2. Backup option
echo ""
read -p "Do you want to backup existing databases? (yes/no): " -r
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Creating backup directory..."
    mkdir -p /var/backups/postgresql

    echo "Backing up all databases..."
    # Start PostgreSQL temporarily for backup
    systemctl start postgresql
    sleep 3

    # Backup all databases
    sudo -u postgres pg_dumpall > /var/backups/postgresql/backup_$(date +%Y%m%d_%H%M%S).sql

    # Stop again
    systemctl stop postgresql
    print_success "Backup created in /var/backups/postgresql/"
fi

# 3. Remove PostgreSQL 16
echo ""
echo "3. Removing PostgreSQL 16..."
apt remove --purge postgresql-16 postgresql-client-16 postgresql-contrib-16 -y
apt autoremove -y
print_success "PostgreSQL 16 removed"

# 4. Add PostgreSQL APT repository
echo ""
echo "4. Adding PostgreSQL APT repository..."
apt install -y curl ca-certificates gnupg
install -d /usr/share/postgresql-common/pgdg
curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
apt update
print_success "PostgreSQL repository added"

# 5. Install PostgreSQL 18
echo ""
echo "5. Installing PostgreSQL 18..."
apt install -y postgresql-18 postgresql-client-18 postgresql-contrib-18
print_success "PostgreSQL 18 installed"

# 6. Start and enable PostgreSQL
echo ""
echo "6. Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql
print_success "PostgreSQL started and enabled"

# 7. Check version
echo ""
echo "7. Verifying installation..."
PG_VERSION=$(sudo -u postgres psql -c "SELECT version();" | grep PostgreSQL)
echo "$PG_VERSION"
print_success "PostgreSQL 18 is running"

# 8. Restore backup if exists
echo ""
if [ -d "/var/backups/postgresql" ] && [ "$(ls -A /var/backups/postgresql)" ]; then
    read -p "Do you want to restore from backup? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        LATEST_BACKUP=$(ls -t /var/backups/postgresql/backup_*.sql | head -1)
        echo "Restoring from: $LATEST_BACKUP"
        sudo -u postgres psql < "$LATEST_BACKUP"
        print_success "Database restored"
    fi
fi

echo ""
echo "=========================================="
print_success "PostgreSQL upgrade completed!"
echo "=========================================="
echo ""
echo "PostgreSQL 18 is now installed and running."
echo "Next steps:"
echo "1. Create your database and user (see below)"
echo "2. Update your .env file with new connection settings"
echo ""
echo "To create database and user:"
echo "  sudo -u postgres psql"
echo "  CREATE USER bazarlar_user WITH PASSWORD 'your_password';"
echo "  CREATE DATABASE bazarlar_prod OWNER bazarlar_user;"
echo "  GRANT ALL PRIVILEGES ON DATABASE bazarlar_prod TO bazarlar_user;"
echo "  \\c bazarlar_prod"
echo "  GRANT ALL ON SCHEMA public TO bazarlar_user;"
echo "  GRANT CREATE ON SCHEMA public TO bazarlar_user;"
echo ""
