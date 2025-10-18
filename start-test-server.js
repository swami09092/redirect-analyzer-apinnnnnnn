#!/usr/bin/env node
/**
 * Simple test server for Cloudflare Worker
 * Minimal implementation to test all endpoints
 */

const http = require('http');
const { URL } = require('url');

// Load worker code
const fs = require('fs');
const workerCode = fs.readFileSync('./worker.js', 'utf8');

// Mock environment
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

// Execute worker code and get handler
let workerHandler;
try {
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  const workerFunc = new AsyncFunction('URL', 'fetch',
    workerCode + '\nreturn typeof export_default !== "undefined" ? export_default : (typeof default !== "undefined" ? default : null);'
  );
  workerHandler = workerFunc(URL, fetch);
  
  if (!workerHandler || !workerHandler.fetch) {
    throw new Error('Worker does not export a fetch handler');
  }
  console.log('✅ Worker loaded successfully');
} catch (error) {
  console.error('❌ Failed to load worker:', error.message);
  process.exit(1);
}

// Create server
const server = http.createServer(async (req, res) => {
  try {
    // Collect body
    let body = '';
    for await (const chunk of req) {
      body += chunk.toString();
    }
    
    // Build request
    const fullUrl = `http://${req.headers.host || 'localhost:5000'}${req.url}`;
    const headers = new Map();
    Object.entries(req.headers).forEach(([k, v]) => headers.set(k.toLowerCase(), v));
    
    const request = {
      method: req.method,
      url: fullUrl,
      headers: {
        get: (name) => headers.get(name.toLowerCase()) || null,
        forEach: (fn) => headers.forEach((v, k) => fn(v, k))
      },
      json: async () => body ? JSON.parse(body) : {},
      text: async () => body
    };
    
    // Call worker
    const response = await workerHandler.fetch(request, mockEnv, {});
    
    // Send response
    const responseHeaders = {};
    if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
    } else if (response.headers) {
      Object.assign(responseHeaders, response.headers);
    }
    
    res.writeHead(response.status || 200, responseHeaders);
    
    if (typeof response.text === 'function') {
      const text = await response.text();
      res.end(text);
    } else if (response.body) {
      res.end(response.body);
    } else {
      res.end('');
    }
    
  } catch (error) {
    console.error('Request error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }));
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 All 34 API endpoints available`);
  console.log(`🧪 Run tests with: node test-real-urls.js`);
});

server.on('error', (error) => {
  console.error('Server error:', error.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  server.close(() => process.exit(0));
});
