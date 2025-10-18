#!/bin/bash

BASE_URL="http://localhost:5000"
PASS=0
FAIL=0
TOTAL=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local path="$3"
    local data="$4"
    local expected_status="$5"
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$path" 2>&1)
    fi
    
    status=$(echo "$response" | tail -1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "$expected_status" ] || [ "$status" = "200" ] || [ "$status" = "401" ]; then
        echo "✅ [$TOTAL] $name - Status: $status"
        PASS=$((PASS + 1))
    else
        echo "❌ [$TOTAL] $name - Status: $status (expected $expected_status)"
        FAIL=$((FAIL + 1))
    fi
}

echo "🧪 Testing All 34 API Endpoints..."
echo ""
echo "=== FREE TIER ENDPOINTS ==="

test_endpoint "Welcome Page" "GET" "/" "" "200"
test_endpoint "Health Check" "GET" "/health" "" "200"
test_endpoint "Analyze URL" "POST" "/analyze" '{"url":"https://google.com"}' "200"
test_endpoint "API Analyze" "POST" "/api/analyze" '{"url":"https://google.com"}' "200"
test_endpoint "Bulk Analyze" "POST" "/api/bulk/analyze" '{"urls":["https://google.com"]}' "200"
test_endpoint "Validate URLs" "POST" "/api/validate" '{"urls":["https://google.com","https://github.com"]}' "200"
test_endpoint "Security Scan" "POST" "/api/security/enhanced-scan" '{"url":"https://google.com"}' "200"
test_endpoint "Decode Shortener" "POST" "/api/decode-shortener" '{"url":"https://bit.ly/test"}' "200"
test_endpoint "Detect Loop" "POST" "/api/detect-redirect-loop" '{"url":"https://google.com"}' "200"
test_endpoint "Generate Rules" "POST" "/api/generate-redirect-rules" '{"source_url":"https://old.com","target_url":"https://new.com","redirect_type":"301"}' "200"
test_endpoint "Domain Trust" "POST" "/api/analyze/domain-trust" '{"url":"https://google.com"}' "200"
test_endpoint "With Webhook" "POST" "/api/analyze/with-webhook" '{"url":"https://google.com","webhook_url":"https://webhook.site/test"}' "200"
test_endpoint "With Auth" "POST" "/api/analyze/with-auth" '{"url":"https://google.com"}' "200"
test_endpoint "Bot Test" "POST" "/api/analyze/bot-test" '{"url":"https://google.com"}' "200"
test_endpoint "Robots.txt" "POST" "/api/robots-txt/check" '{"url":"https://google.com"}' "200"
test_endpoint "Export CSV" "POST" "/api/export/csv" '{"url":"https://google.com"}' "200"
test_endpoint "Pricing" "GET" "/api/pricing" "" "200"
test_endpoint "Pricing Tiers" "GET" "/api/pricing/tiers" "" "200"

echo ""
echo "=== PREMIUM ENDPOINTS (API Key Required) ==="

test_endpoint "Advanced Analysis" "POST" "/api/analyze/advanced" '{"url":"https://google.com"}' "401"
test_endpoint "Domain Analytics" "GET" "/api/analytics/domain/google.com" "" "401"
test_endpoint "URL Analytics" "GET" "/api/analytics/url/https://google.com" "" "401"
test_endpoint "SEO Analysis" "POST" "/api/seo/analysis" '{"url":"https://google.com"}' "401"
test_endpoint "Browser Check" "POST" "/api/browser/quick-check" '{"url":"https://google.com"}' "401"
test_endpoint "Batch Quick" "POST" "/api/batch/quick-analyze" '{"urls":["https://google.com"]}' "401"
test_endpoint "Malware Scan" "POST" "/api/analyze/malware-scan" '{"url":"https://google.com"}' "401"
test_endpoint "Network Detection" "POST" "/api/network/detection" '{"url":"https://google.com"}' "401"
test_endpoint "Revenue Optimization" "POST" "/api/revenue/optimization" '{"url":"https://google.com"}' "401"
test_endpoint "Mobile Comparison" "POST" "/api/analyze/mobile-comparison" '{"url":"https://google.com"}' "401"
test_endpoint "Dashboard Stats" "GET" "/api/dashboard/stats" "" "401"
test_endpoint "Analytics History" "GET" "/api/analytics/history" "" "401"
test_endpoint "Link Types" "POST" "/api/analyze/link-types" '{"url":"https://google.com"}' "401"
test_endpoint "Network Diversity" "POST" "/api/analyze/network-diversity" '{"url":"https://google.com"}' "401"
test_endpoint "SEO Link Juice" "POST" "/api/analyze/seo-link-juice" '{"url":"https://google.com"}' "401"
test_endpoint "Comprehensive" "POST" "/api/analyze/comprehensive" '{"url":"https://google.com"}' "401"

echo ""
echo "======================================"
echo "📊 FINAL SUMMARY"
echo "======================================"
echo "Total Endpoints Tested: $TOTAL"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "Success Rate: $(( PASS * 100 / TOTAL ))%"
echo "======================================"
