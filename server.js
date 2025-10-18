const http = require('http');
const https = require('https');
const { URL } = require('url');

// Simple Response class
class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  async text() {
    if (typeof this.body === 'string') return this.body;
    return JSON.stringify(this.body);
  }
  
  async json() {
    if (typeof this.body === 'string') return JSON.parse(this.body);
    return this.body;
  }
}

// Make Response available globally
global.Response = Response;
global.URL = URL;

// Make fetch available globally using undici
const { fetch: undiciFetch } = require('undici');
global.fetch = undiciFetch;

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

// Load worker module
let workerExport;
try {
  // Read and execute worker.js
  const fs = require('fs');
  const workerCode = fs.readFileSync('./worker.js', 'utf8');
  
  // Create a context to execute the worker
  const vm = require('vm');
  const sandbox = {
    console,
    URL,
    Response,
    fetch: undiciFetch,
    Headers: Map,
    exports: {},
    module: { exports: {} }
  };
  
  vm.createContext(sandbox);
  vm.runInContext(workerCode, sandbox);
  
  // Get the exported handler
  workerExport = sandbox.export_default || sandbox.default || sandbox.module.exports.default;
  
  if (!workerExport || !workerExport.fetch) {
    throw new Error('Worker does not export a fetch handler');
  }
  
  console.log('✅ Worker loaded successfully');
} catch (error) {
  console.error('❌ Failed to load worker:', error);
  process.exit(1);
}

// Create server
const server = http.createServer(async (req, res) => {
  try {
    // Collect body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyText = Buffer.concat(chunks).toString();
    
    // Build request URL
    const fullUrl = `http://${req.headers.host || 'localhost:5000'}${req.url}`;
    
    // Create request object
    const headers = new Map();
    for (const [key, value] of Object.entries(req.headers)) {
      headers.set(key, value);
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
    
    // Call worker
    const response = await workerExport.fetch(request, mockEnv, {});
    
    // Send response
    const responseHeaders = {};
    if (response.headers) {
      for (const [key, value] of response.headers) {
        responseHeaders[key] = value;
      }
    }
    
    res.writeHead(response.status, responseHeaders);
    const responseText = await response.text();
    res.end(responseText);
    
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 All 34 API endpoints ready`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
