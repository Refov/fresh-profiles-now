#!/bin/bash

# Deployment script for hostcreators.sk
# This script builds the project and prepares it for deployment

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p dist-deploy

# Copy built files
echo "📋 Copying built files..."
cp -r dist/* dist-deploy/

# Copy additional files
echo "📋 Copying additional files..."
cp public/.htaccess dist-deploy/

echo "✅ Build complete! Files are ready in dist-deploy/"
echo ""
echo "📋 Next steps:"
echo "1. Upload the contents of 'dist-deploy/' to your hostcreators.sk server"
echo "2. Make sure your domain refov.com points to the server"
echo "3. Test the deployment"
echo ""
echo "🌐 Your site will be available at: https://refov.com"
