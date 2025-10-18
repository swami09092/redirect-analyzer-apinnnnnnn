const http = require('http');

const BASE_URL = 'http://localhost:5000';
const results = {
  free: { total: 0, passed: 0, failed: 0 },
  premium: { total: 0, passed: 0, failed: 0 }
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    };
    
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test(name, method, path, data, expectedStatus, tier = 'free') {
  const num = results[tier].total + 1;
  results[tier].total++;
  
  try {
    const response = await makeRequest(method, path, data);
    const success = response.status === expectedStatus || 
                   (tier === 'free' && response.status === 200) ||
                   (tier === 'premium' && response.status === 401);
    
    if (success) {
      results[tier].passed++;
      console.log(`✅ [${num}] ${name} - ${response.status}`);
    } else {
      results[tier].failed++;
      console.log(`❌ [${num}] ${name} - ${response.status} (expected ${expectedStatus})`);
    }
    
    return response;
  } catch (error) {
    results[tier].failed++;
    console.log(`❌ [${num}] ${name} - Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Testing Redirect Chain Analyzer API');
  console.log('=' .repeat(60));
  
  console.log('\n📋 FREE TIER ENDPOINTS (18)');
  console.log('-'.repeat(60));
  
  await test('Welcome Page', 'GET', '/', null, 200);
  await test('Health Check', 'GET', '/health', null, 200);
  await test('Analyze URL', 'POST', '/analyze', { url: 'https://google.com' }, 200);
  await test('API Analyze', 'POST', '/api/analyze', { url: 'https://github.com' }, 200);
  await test('Bulk Analyze', 'POST', '/api/bulk/analyze', { urls: ['https://google.com'] }, 200);
  await test('Validate URLs', 'POST', '/api/validate', { urls: ['https://google.com', 'https://github.com'] }, 200);
  await test('Security Scan', 'POST', '/api/security/enhanced-scan', { url: 'https://google.com' }, 200);
  await test('Decode Shortener', 'POST', '/api/decode-shortener', { url: 'https://bit.ly/test' }, 200);
  await test('Detect Loop', 'POST', '/api/detect-redirect-loop', { url: 'https://google.com' }, 200);
  await test('Generate Rules', 'POST', '/api/generate-redirect-rules', { source_url: 'https://old.com', target_url: 'https://new.com', redirect_type: '301' }, 200);
  await test('Domain Trust', 'POST', '/api/analyze/domain-trust', { url: 'https://google.com' }, 200);
  await test('With Webhook', 'POST', '/api/analyze/with-webhook', { url: 'https://google.com', webhook_url: 'https://webhook.site/test' }, 200);
  await test('With Auth', 'POST', '/api/analyze/with-auth', { url: 'https://google.com' }, 200);
  await test('Bot Test', 'POST', '/api/analyze/bot-test', { url: 'https://google.com' }, 200);
  await test('Robots.txt Check', 'POST', '/api/robots-txt/check', { url: 'https://google.com' }, 200);
  await test('Export CSV', 'POST', '/api/export/csv', { url: 'https://google.com' }, 200);
  await test('Pricing Info', 'GET', '/api/pricing', null, 200);
  await test('Pricing Tiers', 'GET', '/api/pricing/tiers', null, 200);
  
  console.log('\n🔒 PREMIUM ENDPOINTS (16)');
  console.log('-'.repeat(60));
  
  await test('Advanced Analysis', 'POST', '/api/analyze/advanced', { url: 'https://google.com' }, 401, 'premium');
  await test('Domain Analytics', 'GET', '/api/analytics/domain/google.com', null, 401, 'premium');
  await test('URL Analytics', 'GET', '/api/analytics/url/https://google.com', null, 401, 'premium');
  await test('SEO Analysis', 'POST', '/api/seo/analysis', { url: 'https://google.com' }, 401, 'premium');
  await test('Browser Check', 'POST', '/api/browser/quick-check', { url: 'https://google.com' }, 401, 'premium');
  await test('Batch Quick', 'POST', '/api/batch/quick-analyze', { urls: ['https://google.com'] }, 401, 'premium');
  await test('Malware Scan', 'POST', '/api/analyze/malware-scan', { url: 'https://google.com' }, 401, 'premium');
  await test('Network Detection', 'POST', '/api/network/detection', { url: 'https://google.com' }, 401, 'premium');
  await test('Revenue Optimization', 'POST', '/api/revenue/optimization', { url: 'https://google.com' }, 401, 'premium');
  await test('Mobile Comparison', 'POST', '/api/analyze/mobile-comparison', { url: 'https://google.com' }, 401, 'premium');
  await test('Dashboard Stats', 'GET', '/api/dashboard/stats', null, 401, 'premium');
  await test('Analytics History', 'GET', '/api/analytics/history', null, 401, 'premium');
  await test('Link Types', 'POST', '/api/analyze/link-types', { url: 'https://google.com' }, 401, 'premium');
  await test('Network Diversity', 'POST', '/api/analyze/network-diversity', { url: 'https://google.com' }, 401, 'premium');
  await test('SEO Link Juice', 'POST', '/api/analyze/seo-link-juice', { url: 'https://google.com' }, 401, 'premium');
  await test('Comprehensive', 'POST', '/api/analyze/comprehensive', { url: 'https://google.com' }, 401, 'premium');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`\n🆓 Free Tier:    ${results.free.passed}/${results.free.total} passed (${Math.round(results.free.passed/results.free.total*100)}%)`);
  console.log(`🔒 Premium Tier: ${results.premium.passed}/${results.premium.total} passed (${Math.round(results.premium.passed/results.premium.total*100)}%)`);
  console.log(`\n✅ Total Passed: ${results.free.passed + results.premium.passed}/34`);
  console.log(`❌ Total Failed: ${results.free.failed + results.premium.failed}/34`);
  console.log(`📈 Success Rate: ${Math.round((results.free.passed + results.premium.passed)/34*100)}%\n`);
  
  if (results.free.passed === 18 && results.premium.passed === 16) {
    console.log('🎉 ALL ENDPOINTS WORKING PERFECTLY!\n');
  }
}

// Wait for server to start
setTimeout(() => {
  runTests().catch(console.error);
}, 2000);
