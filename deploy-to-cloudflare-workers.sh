#!/bin/bash

# Cloudflare Workers Deployment Script
# This script helps you deploy your Redirect Chain Analyzer API to Cloudflare Workers

set -e

echo "🚀 Cloudflare Workers Deployment Script"
echo "========================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Check if user is logged in
echo "📝 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "Running: wrangler login"
    wrangler login
else
    echo "✅ Already logged in to Cloudflare"
fi
echo ""

# Ask user if they want to create KV namespaces
echo "🗄️  KV Namespace Setup"
echo "===================="
read -p "Have you created the KV namespaces? (y/n): " kv_created

if [ "$kv_created" != "y" ]; then
    echo ""
    echo "Creating KV namespaces..."
    echo ""
    
    echo "Creating RATE_LIMITS namespace..."
    wrangler kv:namespace create RATE_LIMITS
    wrangler kv:namespace create RATE_LIMITS --preview
    echo ""
    
    echo "Creating ANALYTICS_DATA namespace..."
    wrangler kv:namespace create ANALYTICS_DATA
    wrangler kv:namespace create ANALYTICS_DATA --preview
    echo ""
    
    echo "Creating API_KEYS namespace..."
    wrangler kv:namespace create API_KEYS
    wrangler kv:namespace create API_KEYS --preview
    echo ""
    
    echo "⚠️  IMPORTANT: Copy the IDs from above and update wrangler.toml"
    echo "Press Enter to continue after updating wrangler.toml..."
    read
fi

echo ""
echo "🧪 Testing locally..."
read -p "Do you want to test locally first? (y/n): " test_local

if [ "$test_local" = "y" ]; then
    echo "Starting local development server..."
    echo "Press Ctrl+C to stop and continue with deployment"
    wrangler dev
fi

echo ""
echo "📤 Deploying to Cloudflare Workers..."
read -p "Ready to deploy? (y/n): " ready_deploy

if [ "$ready_deploy" = "y" ]; then
    wrangler deploy
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Your API is now live at:"
    echo "https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev"
    echo ""
    echo "Test it with:"
    echo "curl https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev/health"
else
    echo "Deployment cancelled"
fi
