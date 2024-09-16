#!/bin/bash

echo "Starting Frontend Deployment Process"

# Set the NVM directory and load NVM
export NVM_DIR="/home/ec2-user/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load NVM

# Use Node.js version 16 (adjust if needed)
#nvm use 16

# Add the directory where PM2 is installed to the PATH
export PATH="/home/ec2-user/.nvm/versions/node/v16.20.2/bin:$PATH"

# Navigate to the Angular project directory
cd /home/ec2-user/Angular_ChildEnr_SDN/

# List PM2 processes (for debugging, can be removed later)
pm2 list

# Start the Angular application using PM2
pm2 start --name angular-app "ng serve --host 0.0.0.0 --port 4200"

# Save the PM2 process list
pm2 save

echo "Frontend Deployment Complete"
