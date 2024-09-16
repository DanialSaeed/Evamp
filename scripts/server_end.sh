#!/bin/bash

# Log everything for debugging
exec > >(tee -i /home/ec2-user/deployment_start_log.txt)
exec 2>&1

echo "Starting Application Process"

# Set the NVM directory for ec2-user
export NVM_DIR="/home/ec2-user/.nvm"

# Load NVM for ec2-user
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "Loading NVM"
    . "$NVM_DIR/nvm.sh"
else
    echo "Failed to load NVM, exiting"
    exit 1
fi

# Ensure PM2 is available in the path
export PATH="$NVM_DIR/versions/node/$(nvm current)/bin:$PATH"

# Navigate to the project directory
echo "Navigating to project directory"
cd /home/ec2-user/Angular_ChildEnr_SDN/ || { echo "Failed to navigate to the project directory"; exit 1; }

# Install project dependencies
echo "Installing project dependencies"
npm install --legacy-peer-deps || { echo "Failed to install npm dependencies"; exit 1; }

# Start the Angular application using PM2
echo "Starting Angular application"
pm2 start "ng serve --host 0.0.0.0 --port 4200" --name "angular-app" || { echo "Failed to start the Angular app with PM2"; exit 1; }

# Save the PM2 process list
pm2 save || { echo "Failed to save PM2 process list"; exit 1; }

# Validate the Angular Application
echo "Validating the Angular Application"
pm2 list

# Optionally, check if the Angular app is accessible
echo "Checking if Angular app is accessible"
curl -I http://localhost:4200 || { echo "Failed to access Angular app at localhost:4200"; exit 1; }

echo "Application Startup Complete"
