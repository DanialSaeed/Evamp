#!/bin/bash

# Log everything for debugging
exec > >(tee -i /home/ec2-user/deployment_log.txt)
exec 2>&1

echo "Starting Deployment Process"

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
nvm install 16 || { echo "Failed to install Node.js"; exit 1; }
nvm use 16 || { echo "Failed to switch to Node.js 16"; exit 1; }

# Verify Node.js and npm installation
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install Angular CLI version 14
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

# Navigate to the project directory
cd /home/ec2-user/Angular_ChildEnr_SDN/ || { echo "Failed to navigate to the project directory"; exit 1; }

# Install project dependencies
npm install --legacy-peer-deps || { echo "Failed to install npm dependencies"; exit 1; }

# Start the Angular application using PM2
pm2 start "ng serve --host 0.0.0.0 --port 4200" --name "angular-app" || { echo "Failed to start the Angular app with PM2"; exit 1; }

# Save the PM2 process list
pm2 save || { echo "Failed to save PM2 process list"; exit 1; }

# Validate the Angular Application
echo "Validating the Angular Application"
pm2 list

# Optionally, check if the Angular app is accessible
curl -I http://localhost:4200 || { echo "Failed to access Angular app at localhost:4200"; exit 1; }

echo "Deployment Complete"
