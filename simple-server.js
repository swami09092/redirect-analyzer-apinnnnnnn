const http = require('http');
const { URL } = require('url');
const { fetch } = require('undici');

// Make fetch and URL global
global.fetch = fetch;
global.URL = URL;

// Simple Response class for compatibility
global.Response = class Response {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = init.headers ? new Map(Object.entries(init.headers)) : new Map();
  }
  
  async text() {
    if (typeof this._body === 'string') return this._body;
    return JSON.stringify(this._body);
  }
  
  async json() {
    const text = await this.text();
    return JSON.parse(text);
  }
};

// Load the worker
const worker = require('./worker-node.js');

// Mock environment
const mockEnv = {
  RATE_LIMITS: { get: async () => null, put: async () => {} },
  ANALYTICS_DATA: { get: async () => null, put: async () => {} },
  API_KEYS: { get: async () => null, put: async () => {} }
};

// Create server
const server = http.createServer(async (req, res) => {
  try {
    // Collect body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyText = Buffer.concat(chunks).toString();
    
    // Create request object
    const fullUrl = `http://${req.headers.host || 'localhost:5000'}${req.url}`;
    const headers = new Map(Object.entries(req.headers));
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
    
    // Call worker
    const response = await worker.fetch(request, mockEnv, {});
    
    // Send response
    const resHeaders = {};
    if (response.headers) {
      for (const [key, value] of response.headers) {
        resHeaders[key] = value;
      }
    }
    
    res.writeHead(response.status, resHeaders);
    const text = await response.text();
    res.end(text);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Server running on http://0.0.0.0:5000');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
