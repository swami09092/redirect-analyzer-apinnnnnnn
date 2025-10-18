const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function testEndpoint(name, method, path, body = null) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          name,
          method,
          path,
          status: res.statusCode,
          success: res.statusCode < 500,
          contentType: res.headers['content-type']
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name,
        method,
        path,
        status: 0,
        success: false,
        error: error.message
      });
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing all 34 API endpoints...\n');
  
  const tests = [
    // Free Tier Endpoints
    { name: '1. Welcome Page', method: 'GET', path: '/' },
    { name: '2. Health Check', method: 'GET', path: '/health' },
    { name: '3. Analyze URL', method: 'POST', path: '/analyze', body: { url: 'https://google.com' } },
    { name: '4. API Analyze', method: 'POST', path: '/api/analyze', body: { url: 'https://google.com' } },
    { name: '5. Bulk Analyze', method: 'POST', path: '/api/bulk/analyze', body: { urls: ['https://google.com'] } },
    { name: '6. Validate URLs', method: 'POST', path: '/api/validate', body: { urls: ['https://google.com'] } },
    { name: '7. Security Scan', method: 'POST', path: '/api/security/enhanced-scan', body: { url: 'https://google.com' } },
    { name: '8. Decode Shortener', method: 'POST', path: '/api/decode-shortener', body: { url: 'https://bit.ly/test' } },
    { name: '9. Detect Loop', method: 'POST', path: '/api/detect-redirect-loop', body: { url: 'https://google.com' } },
    { name: '10. Generate Rules', method: 'POST', path: '/api/generate-redirect-rules', body: { source_url: 'https://old.com', target_url: 'https://new.com' } },
    { name: '11. Domain Trust', method: 'POST', path: '/api/analyze/domain-trust', body: { url: 'https://google.com' } },
    { name: '12. With Webhook', method: 'POST', path: '/api/analyze/with-webhook', body: { url: 'https://google.com', webhook_url: 'https://webhook.site/test' } },
    { name: '13. With Auth', method: 'POST', path: '/api/analyze/with-auth', body: { url: 'https://google.com' } },
    { name: '14. Bot Test', method: 'POST', path: '/api/analyze/bot-test', body: { url: 'https://google.com' } },
    { name: '15. Robots.txt', method: 'POST', path: '/api/robots-txt/check', body: { url: 'https://google.com' } },
    { name: '16. Export CSV', method: 'POST', path: '/api/export/csv', body: { url: 'https://google.com' } },
    { name: '17. Pricing', method: 'GET', path: '/api/pricing' },
    { name: '18. Pricing Tiers', method: 'GET', path: '/api/pricing/tiers' },
    
    // Premium Endpoints (will return 401)
    { name: '19. Advanced Analysis', method: 'POST', path: '/api/analyze/advanced', body: { url: 'https://google.com' } },
    { name: '20. Domain Analytics', method: 'GET', path: '/api/analytics/domain/google.com' },
    { name: '21. URL Analytics', method: 'GET', path: '/api/analytics/url/https://google.com' },
    { name: '22. SEO Analysis', method: 'POST', path: '/api/seo/analysis', body: { url: 'https://google.com' } },
    { name: '23. Browser Check', method: 'POST', path: '/api/browser/quick-check', body: { url: 'https://google.com' } },
    { name: '24. Batch Quick', method: 'POST', path: '/api/batch/quick-analyze', body: { urls: ['https://google.com'] } },
    { name: '25. Malware Scan', method: 'POST', path: '/api/analyze/malware-scan', body: { url: 'https://google.com' } },
    { name: '26. Network Detection', method: 'POST', path: '/api/network/detection', body: { url: 'https://google.com' } },
    { name: '27. Revenue Optimization', method: 'POST', path: '/api/revenue/optimization', body: { url: 'https://google.com' } },
    { name: '28. Mobile Comparison', method: 'POST', path: '/api/analyze/mobile-comparison', body: { url: 'https://google.com' } },
    { name: '29. Dashboard Stats', method: 'GET', path: '/api/dashboard/stats' },
    { name: '30. Analytics History', method: 'GET', path: '/api/analytics/history' },
    { name: '31. Link Types', method: 'POST', path: '/api/analyze/link-types', body: { url: 'https://google.com' } },
    { name: '32. Network Diversity', method: 'POST', path: '/api/analyze/network-diversity', body: { url: 'https://google.com' } },
    { name: '33. SEO Link Juice', method: 'POST', path: '/api/analyze/seo-link-juice', body: { url: 'https://google.com' } },
    { name: '34. Comprehensive', method: 'POST', path: '/api/analyze/comprehensive', body: { url: 'https://google.com' } }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.method, test.path, test.body);
    results.push(result);
    
    const icon = result.success ? '✅' : '❌';
    const statusText = result.status === 401 ? '🔒 Auth Required' : `${result.status}`;
    console.log(`${icon} ${result.name.padEnd(30)} ${result.method.padEnd(6)} ${statusText}`);
  }
  
  console.log('\n📊 Summary:');
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const free = results.slice(0, 18).filter(r => r.success && r.status === 200).length;
  const premium = results.slice(18).filter(r => r.status === 401).length;
  
  console.log(`Total Endpoints: ${total}`);
  console.log(`✅ Working: ${successful}/${total}`);
  console.log(`🆓 Free Tier (200 OK): ${free}/18`);
  console.log(`🔒 Premium (401 Auth): ${premium}/16`);
  console.log(`❌ Errors (500): ${results.filter(r => r.status >= 500).length}`);
}

runTests().catch(console.error);
