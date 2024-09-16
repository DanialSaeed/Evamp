#!/bin/bash

echo "Starting Deployment Process"

# Set the NVM directory and install Node.js
export NVM_DIR="/home/ec2-user/.nvm"

# Check if NVM directory exists
if [ ! -d "$NVM_DIR" ]; then
    echo "NVM not found, installing NVM"
    mkdir -p "$NVM_DIR"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    source /home/ec2-user/.bashrc
fi

# Check if NVM is properly installed and load it
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "Loading NVM"
    . "$NVM_DIR/nvm.sh"
else
    echo "NVM installation failed, exiting."
    exit 1
fi

# Install Node.js 16 using NVM
nvm install 16 || { echo "Failed to install Node.js"; exit 1; }
nvm use 16 || { echo "Failed to switch to Node.js 16"; exit 1; }

# Verify Node.js and npm installation
node -v || { echo "Node.js installation failed"; exit 1; }
npm -v || { echo "npm installation failed"; exit 1; }

# Install Angular CLI version 14
npm install -g @angular/cli@14 || { echo "Failed to install Angular CLI"; exit 1; }

# Navigate to the project directory
cd /home/ec2-user/Angular_ChildEnr_SDN/ || { echo "Project directory not found"; exit 1; }

# Install project dependencies
npm install || { echo "npm install failed"; exit 1; }

# Install PM2 globally
npm install -g pm2 || { echo "PM2 installation failed"; exit 1; }

# Add the directory where pm2 is installed to the PATH
export PATH="/home/ec2-user/.nvm/versions/node/v16.*/bin:$PATH"

# List the pm2 processes (for debugging)
pm2 list

# Start the Angular application using PM2
pm2 start "ng serve --host 0.0.0.0 --port 4200" --name "angular-app" || { echo "Failed to start Angular app with PM2"; exit 1; }

# Save the PM2 process list
pm2 save || { echo "Failed to save PM2 process list"; exit 1; }

echo "Deployment completed successfully"
