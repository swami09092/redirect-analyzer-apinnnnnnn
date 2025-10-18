#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const { fetch, Headers, Response } = require('undici');

// Make globals available
global.fetch = fetch;
global.Headers = Headers;
global.Response = Response;

console.log('Loading worker code...');

// Read worker.js and convert to CommonJS
let workerCode = fs.readFileSync('./worker.js', 'utf8');
workerCode = workerCode.replace('export default {', 'module.exports = {');

// Write and load
fs.writeFileSync('.worker-temp.js', workerCode);
const worker = require('./.worker-temp.js');

console.log('✓ Worker loaded');

// Mock environment
const env = {
  RATE_LIMITS: { get: async () => null, put: async () => {} },
  ANALYTICS_DATA: { get: async () => null, put: async () => {} },
  API_KEYS: { get: async () => null, put: async () => {} }
};

// Create server
const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    
    await new Promise(resolve => req.on('end', resolve));
    
    const body = Buffer.concat(chunks).toString();
    const url = `http://${req.headers.host}${req.url}`;
    
    const request = {
      method: req.method,
      url: url,
      headers: new Headers(req.headers),
      json: async () => body ? JSON.parse(body) : {},
      text: async () => body
    };
    
    const response = await worker.fetch(request, env, {});
    
    // Send response
    const headers = {};
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value;
    }
    
    res.writeHead(response.status, headers);
    const text = await response.text();
    res.end(text);
    
  } catch (err) {
    console.error('Request error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 API Server Running on http://0.0.0.0:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
