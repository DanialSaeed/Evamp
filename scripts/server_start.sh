#!/bin/bash

# Log everything for debugging
exec > >(tee -i /home/ec2-user/deployment_install_log.txt)
exec 2>&1

echo "Starting Installation Process"

# Set the NVM directory for ec2-user
export NVM_DIR="/home/ec2-user/.nvm"

# Function to install NVM
install_nvm() {
    echo "NVM not found, installing NVM"
    mkdir -p "$NVM_DIR"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    # Source the user's profile to load NVM
    source /home/ec2-user/.bashrc
}

# Install NVM if not found
if [ ! -d "$NVM_DIR" ]; then
    install_nvm
else
    echo "NVM is already installed"
    # Source NVM to ensure it's loaded in this script
    source "$NVM_DIR/nvm.sh"
fi

# Load NVM for ec2-user
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "Loading NVM"
    . "$NVM_DIR/nvm.sh"
else
    echo "Failed to load NVM, exiting"
    exit 1
fi

# Install Node.js 16 using NVM for ec2-user
echo "Installing Node.js 16"
nvm install 16 || { echo "Failed to install Node.js"; exit 1; }
nvm use 16 || { echo "Failed to switch to Node.js 16"; exit 1; }

# Verify Node.js and npm installation
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install Angular CLI version 14
echo "Installing Angular CLI version 14"
npm install -g @angular/cli@14 || { echo "Failed to install Angular CLI"; exit 1; }

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing PM2"
    npm install -g pm2 || { echo "Failed to install PM2"; exit 1; }
else
    echo "PM2 is already installed"
fi

# Ensure PM2 is available in the path
export PATH="$NVM_DIR/versions/node/$(nvm current)/bin:$PATH"

echo "Installation Complete"
