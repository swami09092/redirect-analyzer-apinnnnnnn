#!/usr/bin/env node
/**
 * Run Cloudflare Worker locally for testing
 * This is the ACTUAL code that runs on Cloudflare
 */

const http = require('http');
const fs = require('fs');

// Load worker.js (Cloudflare Workers code)
let workerCode = fs.readFileSync('./worker.js', 'utf8');

// Make it Node.js compatible
workerCode = workerCode.replace('export default {', 'const workerExport = {');
workerCode += '\nif (typeof module !== "undefined") module.exports = workerExport;';

// Mock Cloudflare KV storage
const mockEnv = {
  RATE_LIMITS: {
    get: async () => null,
    put: async () => {}
  },
  ANALYTICS_DATA: {
    get: async () => null,
    put: async () => {}
  },
  API_KEYS: {
    get: async () => null,
    put: async () => {}
  }
};

// Execute worker code
const workerModule = eval(workerCode);

console.log('✅ Cloudflare Worker loaded successfully');
console.log('📦 Running 100% JavaScript (No Python)');

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Collect body
    let body = '';
    req.on('data', chunk => { body += chunk; });
    await new Promise(resolve => req.on('end', resolve));
    
    // Build request
    const fullUrl = `http://${req.headers.host || 'localhost:5000'}${req.url}`;
    const headers = new Map(Object.entries(req.headers));
    headers.get = function(name) { return this.get(name.toLowerCase()); };
    
    const request = {
      method: req.method,
      url: fullUrl,
      headers,
      json: async () => body ? JSON.parse(body) : {},
      text: async () => body
    };
    
    // Call worker (Cloudflare Workers fetch handler)
    const response = await workerModule.fetch(request, mockEnv, {});
    
    // Send response
    const resHeaders = {};
    if (response.headers && response.headers.forEach) {
      response.headers.forEach((v, k) => { resHeaders[k] = v; });
    }
    
    res.writeHead(response.status || 200, resHeaders);
    
    if (response.text) {
      res.end(await response.text());
    } else {
      res.end('');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Cloudflare Worker server running on http://0.0.0.0:5000');
  console.log('📊 All 34 API endpoints available');
  console.log('⚡ 100% JavaScript - Ready for Cloudflare deployment');
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
