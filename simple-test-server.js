#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const vm = require('vm');

// Read worker code and transform it for Node.js
let workerCode = fs.readFileSync('./worker.js', 'utf8');

// Remove ES6 export and make it compatible with Node.js
workerCode = workerCode.replace('export default {', 'const workerExport = {');
workerCode += '\nif (typeof module !== "undefined") module.exports = workerExport;';

// Mock environment
const mockEnv = {
  RATE_LIMITS: { get: async () => null, put: async () => {} },
  ANALYTICS_DATA: { get: async () => null, put: async () => {} },
  API_KEYS: { get: async () => null, put: async () => {} }
};

// Load worker in a sandbox
const sandbox = {
  console,
  URL,
  Response,
  fetch,
  Headers: Map,
  module: { exports: {} },
  require
};

vm.createContext(sandbox);

try {
  vm.runInContext(workerCode, sandbox);
  console.log('✅ Worker loaded successfully');
} catch (error) {
  console.error('❌ Failed to load worker:', error.message);
  process.exit(1);
}

const workerHandler = sandbox.module.exports;

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    await new Promise(resolve => req.on('end', resolve));
    
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
    
    const response = await workerHandler.fetch(request, mockEnv, {});
    
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
  console.log('🚀 Server running on http://0.0.0.0:5000');
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
