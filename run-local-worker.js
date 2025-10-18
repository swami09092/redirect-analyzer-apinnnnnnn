#!/usr/bin/env node
/**
 * Local development server for Cloudflare Worker
 * Runs worker.js locally on port 5000 for testing
 */

const http = require('http');
const { URL } = require('url');

// Read the worker code
const fs = require('fs');
const workerCode = fs.readFileSync('./worker.js', 'utf8');

// Mock Cloudflare Workers environment
const createMockEnv = () => ({
  RATE_LIMITS: {
    async get(key) { return null; },
    async put(key, value, options) { return; }
  },
  ANALYTICS_DATA: {
    async get(key) { return null; },
    async put(key, value, options) { return; }
  },
  API_KEYS: {
    async get(key) { return null; },
    async put(key, value, options) { return; }
  }
});

// Parse and execute worker code
let workerHandler;
try {
  // Create a module-like environment
  const module = { exports: {} };
  const exports = module.exports;
  
  // Execute worker code in a context
  const workerFunction = new Function('module', 'exports', 'URL', 'Response', 'fetch', 'Headers', `
    ${workerCode}
    return (typeof export_default !== 'undefined') ? export_default : this.default;
  `);
  
  // Custom Headers class for request
  class RequestHeaders extends Map {
    get(name) {
      return super.get(name.toLowerCase());
    }
    has(name) {
      return super.has(name.toLowerCase());
    }
  }
  
  const worker = workerFunction(module, exports, URL, Response, fetch, Headers);
  workerHandler = worker;
} catch (error) {
  console.error('Failed to load worker:', error);
  process.exit(1);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Collect request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    
    // Build full URL
    const protocol = 'http:';
    const host = req.headers.host || 'localhost:5000';
    const fullUrl = `${protocol}//${host}${req.url}`;
    
    // Create Headers map
    const headers = new Map();
    Object.entries(req.headers).forEach(([key, value]) => {
      headers.set(key.toLowerCase(), value);
    });
    headers.get = function(name) { return this.get(name.toLowerCase()) || Map.prototype.get.call(this, name.toLowerCase()); };
    
    // Create request object
    const request = {
      method: req.method,
      url: fullUrl,
      headers,
      async json() {
        return body ? JSON.parse(body) : {};
      },
      async text() {
        return body;
      }
    };
    
    // Call worker
    const mockEnv = createMockEnv();
    const mockCtx = {};
    
    const response = await workerHandler.fetch(request, mockEnv, mockCtx);
    
    // Send response
    const responseHeaders = {};
    if (response.headers) {
      if (typeof response.headers.forEach === 'function') {
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
      } else {
        for (const [key, value] of Object.entries(response.headers)) {
          responseHeaders[key] = value;
        }
      }
    }
    
    res.writeHead(response.status || 200, responseHeaders);
    
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const text = await response.text();
      res.end(text);
    }
    
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack 
    }));
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Worker server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 All 34 API endpoints available for testing`);
  console.log(`🔍 Test with: node test-all-endpoints.js`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
