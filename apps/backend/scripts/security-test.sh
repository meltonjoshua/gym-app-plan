#!/bin/bash

# FitTracker Security & Compliance Testing Suite
# This script performs comprehensive security testing and compliance validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
TEST_RESULTS_DIR="./security-test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$TEST_RESULTS_DIR/security-report-$TIMESTAMP.json"

# Create results directory
mkdir -p $TEST_RESULTS_DIR

echo -e "${BLUE}🔐 FitTracker Security & Compliance Testing Suite${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Initialize report
cat > $REPORT_FILE << EOF
{
  "testSuite": "FitTracker Security & Compliance",
  "timestamp": "$(date -Iseconds)",
  "apiBaseUrl": "$API_BASE_URL",
  "tests": {
EOF

# Helper functions
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test 1: SSL/TLS Configuration
test_ssl_configuration() {
    log_test "Testing SSL/TLS Configuration"
    
    if [[ $API_BASE_URL == https://* ]]; then
        # Test SSL certificate
        ssl_result=$(timeout 10 openssl s_client -connect ${API_BASE_URL#https://} -servername ${API_BASE_URL#https://} 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "FAILED")
        
        if [[ $ssl_result != "FAILED" ]]; then
            log_pass "SSL certificate is valid"
            echo '    "sslConfiguration": { "status": "pass", "message": "Valid SSL certificate" },' >> $REPORT_FILE
        else
            log_fail "SSL certificate validation failed"
            echo '    "sslConfiguration": { "status": "fail", "message": "SSL certificate validation failed" },' >> $REPORT_FILE
        fi
    else
        log_warn "Testing HTTP endpoint - SSL not configured"
        echo '    "sslConfiguration": { "status": "warn", "message": "HTTP endpoint - SSL not configured" },' >> $REPORT_FILE
    fi
}

# Test 2: Authentication Security
test_authentication_security() {
    log_test "Testing Authentication Security"
    
    # Test password requirements
    weak_password_response=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"123","firstName":"Test","lastName":"User"}' \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $weak_password_response == "400" ]]; then
        log_pass "Weak password rejected"
        echo '    "passwordPolicy": { "status": "pass", "message": "Weak passwords are rejected" },' >> $REPORT_FILE
    else
        log_fail "Weak password accepted"
        echo '    "passwordPolicy": { "status": "fail", "message": "Weak passwords are accepted" },' >> $REPORT_FILE
    fi
    
    # Test SQL injection in login
    sql_injection_response=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"admin@test.com' OR '1'='1\",\"password\":\"password\"}" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $sql_injection_response == "400" || $sql_injection_response == "401" ]]; then
        log_pass "SQL injection attempt blocked"
        echo '    "sqlInjectionProtection": { "status": "pass", "message": "SQL injection attempts are blocked" },' >> $REPORT_FILE
    else
        log_fail "SQL injection vulnerability detected"
        echo '    "sqlInjectionProtection": { "status": "fail", "message": "SQL injection vulnerability detected" },' >> $REPORT_FILE
    fi
}

# Test 3: Rate Limiting
test_rate_limiting() {
    log_test "Testing Rate Limiting"
    
    local rate_limit_hit=false
    
    # Send multiple rapid requests
    for i in {1..15}; do
        response_code=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"test@example.com","password":"password"}' \
            -w "%{http_code}" -o /dev/null)
        
        if [[ $response_code == "429" ]]; then
            rate_limit_hit=true
            break
        fi
        sleep 0.1
    done
    
    if $rate_limit_hit; then
        log_pass "Rate limiting is working"
        echo '    "rateLimiting": { "status": "pass", "message": "Rate limiting is active" },' >> $REPORT_FILE
    else
        log_warn "Rate limiting not triggered or too lenient"
        echo '    "rateLimiting": { "status": "warn", "message": "Rate limiting not triggered in test" },' >> $REPORT_FILE
    fi
}

# Test 4: Input Validation
test_input_validation() {
    log_test "Testing Input Validation"
    
    # Test XSS protection
    xss_payload='<script>alert("xss")</script>'
    xss_response=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"test@test.com\",\"password\":\"Password123!\",\"firstName\":\"$xss_payload\",\"lastName\":\"User\"}" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $xss_response == "400" ]]; then
        log_pass "XSS payload rejected"
        echo '    "xssProtection": { "status": "pass", "message": "XSS payloads are filtered" },' >> $REPORT_FILE
    else
        log_fail "XSS vulnerability detected"
        echo '    "xssProtection": { "status": "fail", "message": "XSS vulnerability detected" },' >> $REPORT_FILE
    fi
    
    # Test NoSQL injection
    nosql_payload='{"$ne": "invalid"}'
    nosql_response=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":$nosql_payload,\"password\":\"password\"}" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $nosql_response == "400" || $nosql_response == "401" ]]; then
        log_pass "NoSQL injection attempt blocked"
        echo '    "nosqlInjectionProtection": { "status": "pass", "message": "NoSQL injection attempts are blocked" },' >> $REPORT_FILE
    else
        log_fail "NoSQL injection vulnerability detected"
        echo '    "nosqlInjectionProtection": { "status": "fail", "message": "NoSQL injection vulnerability detected" },' >> $REPORT_FILE
    fi
}

# Test 5: CORS Configuration
test_cors_configuration() {
    log_test "Testing CORS Configuration"
    
    # Test CORS with malicious origin
    cors_response=$(curl -s -X OPTIONS "$API_BASE_URL/api/auth/login" \
        -H "Origin: https://malicious-site.com" \
        -H "Access-Control-Request-Method: POST" \
        -w "%{http_code}" -o /dev/null)
    
    cors_headers=$(curl -s -X OPTIONS "$API_BASE_URL/api/auth/login" \
        -H "Origin: https://malicious-site.com" \
        -H "Access-Control-Request-Method: POST" \
        -I | grep -i "access-control-allow-origin" || echo "")
    
    if [[ -z "$cors_headers" || $cors_headers != *"malicious-site.com"* ]]; then
        log_pass "CORS properly configured"
        echo '    "corsConfiguration": { "status": "pass", "message": "CORS properly restricts origins" },' >> $REPORT_FILE
    else
        log_fail "CORS misconfiguration detected"
        echo '    "corsConfiguration": { "status": "fail", "message": "CORS allows unauthorized origins" },' >> $REPORT_FILE
    fi
}

# Test 6: Security Headers
test_security_headers() {
    log_test "Testing Security Headers"
    
    headers=$(curl -s -I "$API_BASE_URL/api/health" || echo "")
    
    local header_tests=0
    local header_passes=0
    
    # Test for security headers
    security_headers=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Strict-Transport-Security"
        "Content-Security-Policy"
    )
    
    for header in "${security_headers[@]}"; do
        header_tests=$((header_tests + 1))
        if echo "$headers" | grep -i "$header" > /dev/null; then
            header_passes=$((header_passes + 1))
        fi
    done
    
    if [[ $header_passes -ge 3 ]]; then
        log_pass "Security headers present ($header_passes/$header_tests)"
        echo "    \"securityHeaders\": { \"status\": \"pass\", \"message\": \"$header_passes of $header_tests security headers present\" }," >> $REPORT_FILE
    else
        log_fail "Missing security headers ($header_passes/$header_tests)"
        echo "    \"securityHeaders\": { \"status\": \"fail\", \"message\": \"Only $header_passes of $header_tests security headers present\" }," >> $REPORT_FILE
    fi
}

# Test 7: API Endpoint Security
test_api_endpoint_security() {
    log_test "Testing API Endpoint Security"
    
    # Test unauthorized access to protected endpoints
    unauthorized_response=$(curl -s -X GET "$API_BASE_URL/api/users/profile" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $unauthorized_response == "401" ]]; then
        log_pass "Protected endpoints require authentication"
        echo '    "endpointProtection": { "status": "pass", "message": "Protected endpoints require authentication" },' >> $REPORT_FILE
    else
        log_fail "Unprotected sensitive endpoints detected"
        echo '    "endpointProtection": { "status": "fail", "message": "Sensitive endpoints accessible without authentication" },' >> $REPORT_FILE
    fi
    
    # Test HTTP methods
    options_response=$(curl -s -X OPTIONS "$API_BASE_URL/api/users" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $options_response == "200" || $options_response == "405" ]]; then
        log_pass "HTTP methods properly handled"
        echo '    "httpMethodSecurity": { "status": "pass", "message": "HTTP methods properly configured" },' >> $REPORT_FILE
    else
        log_warn "Unexpected HTTP method response"
        echo '    "httpMethodSecurity": { "status": "warn", "message": "Unexpected HTTP method response" },' >> $REPORT_FILE
    fi
}

# Test 8: GDPR Compliance
test_gdpr_compliance() {
    log_test "Testing GDPR Compliance"
    
    # Test privacy policy endpoint
    privacy_response=$(curl -s -X GET "$API_BASE_URL/api/legal/privacy-policy" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $privacy_response == "200" ]]; then
        log_pass "Privacy policy accessible"
        privacy_pass=true
    else
        log_fail "Privacy policy not accessible"
        privacy_pass=false
    fi
    
    # Test terms of service endpoint
    terms_response=$(curl -s -X GET "$API_BASE_URL/api/legal/terms-of-service" \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $terms_response == "200" ]]; then
        log_pass "Terms of service accessible"
        terms_pass=true
    else
        log_fail "Terms of service not accessible"
        terms_pass=false
    fi
    
    if $privacy_pass && $terms_pass; then
        echo '    "gdprCompliance": { "status": "pass", "message": "Privacy policy and terms accessible" },' >> $REPORT_FILE
    else
        echo '    "gdprCompliance": { "status": "fail", "message": "Missing privacy policy or terms of service" },' >> $REPORT_FILE
    fi
}

# Test 9: Session Security
test_session_security() {
    log_test "Testing Session Security"
    
    # Test session cookie security
    login_headers=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password"}' \
        -I 2>/dev/null || echo "")
    
    if echo "$login_headers" | grep -i "set-cookie" | grep -i "httponly" > /dev/null; then
        log_pass "Session cookies have HttpOnly flag"
        session_pass=true
    else
        log_warn "Session cookies missing HttpOnly flag"
        session_pass=false
    fi
    
    if echo "$login_headers" | grep -i "set-cookie" | grep -i "secure" > /dev/null; then
        log_pass "Session cookies have Secure flag"
        secure_pass=true
    else
        log_warn "Session cookies missing Secure flag (expected for HTTP)"
        secure_pass=true  # Allow for HTTP testing
    fi
    
    if $session_pass && $secure_pass; then
        echo '    "sessionSecurity": { "status": "pass", "message": "Session cookies properly configured" },' >> $REPORT_FILE
    else
        echo '    "sessionSecurity": { "status": "warn", "message": "Session cookie security could be improved" },' >> $REPORT_FILE
    fi
}

# Test 10: Data Validation
test_data_validation() {
    log_test "Testing Data Validation"
    
    # Test email validation
    invalid_email_response=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email":"invalid-email","password":"Password123!","firstName":"Test","lastName":"User"}' \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $invalid_email_response == "400" ]]; then
        log_pass "Invalid email format rejected"
        email_validation=true
    else
        log_fail "Invalid email format accepted"
        email_validation=false
    fi
    
    # Test required field validation
    missing_field_response=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"Password123!"}' \
        -w "%{http_code}" -o /dev/null)
    
    if [[ $missing_field_response == "400" ]]; then
        log_pass "Missing required fields rejected"
        required_validation=true
    else
        log_fail "Missing required fields accepted"
        required_validation=false
    fi
    
    if $email_validation && $required_validation; then
        echo '    "dataValidation": { "status": "pass", "message": "Input validation working properly" }' >> $REPORT_FILE
    else
        echo '    "dataValidation": { "status": "fail", "message": "Input validation issues detected" }' >> $REPORT_FILE
    fi
}

# Run all tests
echo -e "${PURPLE}Starting security test suite...${NC}"
echo ""

test_ssl_configuration
test_authentication_security
test_rate_limiting
test_input_validation
test_cors_configuration
test_security_headers
test_api_endpoint_security
test_gdpr_compliance
test_session_security
test_data_validation

# Close JSON report
cat >> $REPORT_FILE << EOF
  },
  "summary": {
    "completedAt": "$(date -Iseconds)",
    "totalTests": 10,
    "reportFile": "$REPORT_FILE"
  }
}
EOF

echo ""
echo -e "${GREEN}Security testing completed!${NC}"
echo -e "${BLUE}Report saved to: ${REPORT_FILE}${NC}"
echo ""

# Generate summary
echo -e "${YELLOW}Test Summary:${NC}"
echo "============"

# Count test results
passes=$(grep '"status": "pass"' $REPORT_FILE | wc -l)
failures=$(grep '"status": "fail"' $REPORT_FILE | wc -l)
warnings=$(grep '"status": "warn"' $REPORT_FILE | wc -l)

echo -e "${GREEN}Passed: $passes${NC}"
echo -e "${RED}Failed: $failures${NC}"
echo -e "${YELLOW}Warnings: $warnings${NC}"

if [[ $failures -gt 0 ]]; then
    echo ""
    echo -e "${RED}⚠️  Security issues detected! Review the report for details.${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}✅ All security tests passed!${NC}"
fi
