const http = require('http');
const fs = require('fs');

// Read and prepare worker code
let workerCode = fs.readFileSync('./worker.js', 'utf8');

// Convert ES6 export to CommonJS for Node.js
workerCode = workerCode.replace('export default {', 'const workerHandler = {');
workerCode += '\nmodule.exports = workerHandler;';

// Write temporary file
fs.writeFileSync('./.worker-temp.js', workerCode);

// Clear require cache and load worker
delete require.cache[require.resolve('./.worker-temp.js')];
const worker = require('./.worker-temp.js');

// Mock Cloudflare KV storage
const mockKV = {
  async get(key) { return null; },
  async put(key, value) { return; }
};

const mockEnv = {
  RATE_LIMITS: mockKV,
  ANALYTICS_DATA: mockKV,
  API_KEYS: mockKV,
  ENVIRONMENT: 'development',
  API_VERSION: '2.0.0',
  MAX_REDIRECTS: '15',
  REQUEST_TIMEOUT: '8000'
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Collect request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    
    // Create fetch-compatible request
    const url = `http://${req.headers.host || 'localhost:5000'}${req.url}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      headers.set(key, value);
    }
    
    const request = {
      method: req.method,
      url: url,
      headers: headers,
      json: async () => body ? JSON.parse(body) : {},
      text: async () => body
    };
    
    // Call worker handler
    const response = await worker.fetch(request, mockEnv, {});
    
    // Send response
    const responseHeaders = {};
    if (response.headers) {
      for (const [key, value] of response.headers.entries()) {
        responseHeaders[key] = value;
      }
    }
    
    res.writeHead(response.status, responseHeaders);
    const responseBody = await response.text();
    res.end(responseBody);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }));
  }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Redirect Chain Analyzer API Running`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📚 Docs: http://localhost:${PORT}/`);
  console.log(`\n✅ All 34 endpoints ready for testing\n`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
