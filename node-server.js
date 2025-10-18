const http = require('http');
const fs = require('fs');
const { fetch: undiciFetch } = require('undici');

// Make fetch available globally
global.fetch = undiciFetch;

// Mock Cloudflare Workers environment
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

// Read worker.js and convert ES6 export to CommonJS
let workerCode = fs.readFileSync('./worker.js', 'utf8');
workerCode = workerCode.replace('export default {', 'module.exports = {');

// Write temporary CommonJS version
fs.writeFileSync('/tmp/worker-commonjs.js', workerCode);

// Load the worker
const workerExport = require('/tmp/worker-commonjs.js');

if (!workerExport || !workerExport.fetch) {
  console.error('❌ Failed to load worker handler');
  process.exit(1);
}

console.log('✅ Worker loaded successfully');

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyText = Buffer.concat(chunks).toString();
    
    const fullUrl = `http://${req.headers.host || 'localhost:5000'}${req.url}`;
    
    const headers = new Map();
    for (const [key, value] of Object.entries(req.headers)) {
      headers.set(key.toLowerCase(), value);
    }
    headers.get = function(name) {
      return Map.prototype.get.call(this, name.toLowerCase()) || null;
    };
    
    const request = {
      method: req.method,
      url: fullUrl,
      headers,
      json: async () => bodyText ? JSON.parse(bodyText) : {},
      text: async () => bodyText
    };
    
    const response = await workerExport.fetch(request, mockEnv, {});
    
    const responseHeaders = {};
    if (response.headers) {
      for (const [key, value] of response.headers) {
        responseHeaders[key] = value;
      }
    }
    
    res.writeHead(response.status, responseHeaders);
    
    const responseBody = await response.text();
    res.end(responseBody);
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📋 API Documentation: http://0.0.0.0:${PORT}/`);
  console.log(`💚 Health Check: http://0.0.0.0:${PORT}/health`);
});
