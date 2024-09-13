#!/bin/bash

echo "Starting Deployment Process"

# Set the NVM directory and install Node.js
export NVM_DIR="/home/ec2-user/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load NVM

# Install Node.js 16 using NVM
nvm install 16
nvm use 16

# Verify Node.js and npm installation
node -v
npm -v

# Install Angular CLI version 14
npm install -g @angular/cli@14

# Navigate to the project directory
cd /home/ec2-user/Angular_ChildEnr_SDN/

# Install project dependencies
npm install

# Install PM2 globally
npm install -g pm2

# Add the directory where pm2 is installed to the PATH
export PATH="/home/ec2-user/.nvm/versions/node/v16.*/bin:$PATH"

# List the pm2 processes (for debugging)
pm2 list

# Start the Angular application using PM2
pm2 start "ng serve --host 0.0.0.0 --port 4200" --name "angular-app"

# Save the PM2 process list
pm2 save


