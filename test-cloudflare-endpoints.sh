#!/bin/bash

# Cloudflare Workers API Testing Script
# Tests all endpoints after deployment

# Set your Worker URL here
WORKER_URL="${1:-https://redirect-analyzer-api.YOUR-SUBDOMAIN.workers.dev}"
API_KEY="${2:-test-api-key-12345}"

echo "🧪 Testing Cloudflare Workers API"
echo "=================================="
echo "Worker URL: $WORKER_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL=0
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local path="$3"
    local data="$4"
    local expect_status="${5:-200}"
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$WORKER_URL$path")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$WORKER_URL$path" \
            -H "Content-Type: application/json" \
            -H "X-API-Key: $API_KEY" \
            -d "$data")
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status" = "$expect_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expect_status, Got: $status)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
    fi
}

echo "=== FREE TIER ENDPOINTS ==="
echo ""

test_endpoint "Health Check" "GET" "/health" "" 200
test_endpoint "Documentation Page" "GET" "/" "" 200
test_endpoint "Basic URL Analysis" "POST" "/analyze" '{"url":"https://google.com"}' 200
test_endpoint "Bulk Analysis" "POST" "/api/bulk/analyze" '{"urls":["https://google.com","https://github.com"]}' 200
test_endpoint "URL Validation" "POST" "/api/validate" '{"urls":["https://google.com"]}' 200
test_endpoint "Security Scan" "POST" "/api/security/enhanced-scan" '{"url":"https://google.com"}' 200
test_endpoint "Decode Shortener" "POST" "/api/decode-shortener" '{"url":"https://bit.ly/3x7g2Yz"}' 200
test_endpoint "Detect Redirect Loop" "POST" "/api/detect-redirect-loop" '{"url":"https://google.com"}' 200
test_endpoint "Domain Trust" "POST" "/api/analyze/domain-trust" '{"url":"https://google.com"}' 200
test_endpoint "Webhook Analysis" "POST" "/api/analyze/with-webhook" '{"url":"https://google.com","webhook_url":"https://example.com/webhook"}' 200
test_endpoint "Auth Analysis" "POST" "/api/analyze/with-auth" '{"url":"https://google.com","username":"test","password":"pass"}' 200
test_endpoint "Bot Test" "POST" "/api/analyze/bot-test" '{"url":"https://google.com","bot_types":["googlebot"]}' 200
test_endpoint "Robots.txt Check" "POST" "/api/robots-txt/check" '{"url":"https://google.com"}' 200
test_endpoint "CSV Export" "POST" "/api/export/csv" '{"url":"https://google.com"}' 200
test_endpoint "Pricing Info" "GET" "/api/pricing" "" 200
test_endpoint "Pricing Tiers" "GET" "/api/pricing/tiers" "" 200

echo ""
echo "=== PREMIUM ENDPOINTS (Require API Key) ==="
echo ""

test_endpoint "Advanced Analysis" "POST" "/api/analyze/advanced" '{"url":"https://google.com"}' 200
test_endpoint "SEO Analysis" "POST" "/api/seo/analysis" '{"url":"https://google.com"}' 200
test_endpoint "Mobile Comparison" "POST" "/api/analyze/mobile-comparison" '{"url":"https://google.com"}' 200
test_endpoint "Malware Scan" "POST" "/api/analyze/malware-scan" '{"url":"https://google.com"}' 200
test_endpoint "Network Detection" "POST" "/api/network/detection" '{"url":"https://google.com"}' 200
test_endpoint "Link Types" "POST" "/api/analyze/link-types" '{"url":"https://google.com"}' 200
test_endpoint "Network Diversity" "POST" "/api/analyze/network-diversity" '{"url":"https://google.com"}' 200
test_endpoint "SEO Link Juice" "POST" "/api/analyze/seo-link-juice" '{"url":"https://google.com"}' 200
test_endpoint "Comprehensive Analysis" "POST" "/api/analyze/comprehensive" '{"url":"https://google.com"}' 200
test_endpoint "Dashboard Stats" "GET" "/api/dashboard/stats" "" 200
test_endpoint "Analytics History" "GET" "/api/analytics/history" "" 200

echo ""
echo "=== ERROR HANDLING TESTS ==="
echo ""

test_endpoint "Invalid Endpoint" "GET" "/invalid-path" "" 404
test_endpoint "Missing URL Parameter" "POST" "/analyze" '{}' 400
test_endpoint "Invalid URL" "POST" "/analyze" '{"url":"not-a-url"}' 400

echo ""
echo "=================================="
echo "Test Results:"
echo -e "Total:  $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
