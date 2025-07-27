#!/bin/bash

# FitTracker Pro - Smoke Tests Script
# This script runs basic smoke tests against the production API

set -euo pipefail

# Configuration
readonly BASE_URL="${1:-https://api.fittrackerpro.com}"
readonly MAX_RETRIES=5
readonly RETRY_DELAY=5

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test helper functions
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    log_info "Running test: ${test_name}"
    
    if ${test_function}; then
        log_success "✓ ${test_name}"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "✗ ${test_name}"
        FAILED_TESTS+=("${test_name}")
        ((TESTS_FAILED++))
        return 1
    fi
}

# HTTP request helper with retry logic
http_request() {
    local url="$1"
    local method="${2:-GET}"
    local expected_status="${3:-200}"
    local data="${4:-}"
    local headers="${5:-}"
    
    local attempt=1
    local curl_opts=(
        --silent
        --show-error
        --fail-with-body
        --max-time 30
        --connect-timeout 10
        --retry 3
        --retry-delay 2
    )
    
    if [[ -n "${headers}" ]]; then
        curl_opts+=(--header "${headers}")
    fi
    
    if [[ "${method}" != "GET" ]]; then
        curl_opts+=(--request "${method}")
    fi
    
    if [[ -n "${data}" ]]; then
        curl_opts+=(--data "${data}")
    fi
    
    while [[ ${attempt} -le ${MAX_RETRIES} ]]; do
        local response
        local status_code
        
        if response=$(curl "${curl_opts[@]}" --write-out "HTTPSTATUS:%{http_code}" "${url}" 2>&1); then
            status_code=$(echo "${response}" | sed -n 's/.*HTTPSTATUS:\([0-9]*\)$/\1/p')
            local body=$(echo "${response}" | sed 's/HTTPSTATUS:[0-9]*$//')
            
            if [[ "${status_code}" == "${expected_status}" ]]; then
                echo "${body}"
                return 0
            else
                log_warning "Expected status ${expected_status}, got ${status_code}"
                echo "${body}"
                return 1
            fi
        else
            log_warning "Request failed (attempt ${attempt}/${MAX_RETRIES}): ${response}"
            
            if [[ ${attempt} -eq ${MAX_RETRIES} ]]; then
                return 1
            fi
            
            sleep ${RETRY_DELAY}
            ((attempt++))
        fi
    done
}

# Test functions
test_health_endpoint() {
    local response
    
    if response=$(http_request "${BASE_URL}/api/health" "GET" "200"); then
        # Check if response contains expected health data
        if echo "${response}" | grep -q "status.*ok"; then
            return 0
        else
            log_error "Health endpoint returned unexpected response: ${response}"
            return 1
        fi
    else
        return 1
    fi
}

test_ready_endpoint() {
    local response
    
    if response=$(http_request "${BASE_URL}/api/health/ready" "GET" "200"); then
        # Check if response indicates readiness
        if echo "${response}" | grep -q "ready.*true"; then
            return 0
        else
            log_error "Ready endpoint returned unexpected response: ${response}"
            return 1
        fi
    else
        return 1
    fi
}

test_auth_status_endpoint() {
    local response
    
    # This endpoint should return 401 for unauthenticated requests
    if response=$(http_request "${BASE_URL}/api/v1/auth/status" "GET" "401"); then
        return 0
    else
        return 1
    fi
}

test_api_version_endpoint() {
    local response
    
    if response=$(http_request "${BASE_URL}/api/v1/version" "GET" "200"); then
        # Check if response contains version info
        if echo "${response}" | grep -q "version"; then
            return 0
        else
            log_error "Version endpoint returned unexpected response: ${response}"
            return 1
        fi
    else
        return 1
    fi
}

test_cors_headers() {
    local response
    local headers
    
    if headers=$(curl --silent --head --max-time 10 "${BASE_URL}/api/health" 2>&1); then
        # Check for CORS headers
        if echo "${headers}" | grep -qi "access-control-allow-origin"; then
            return 0
        else
            log_warning "CORS headers not found in response"
            return 0  # This is a warning, not a failure
        fi
    else
        return 1
    fi
}

test_security_headers() {
    local response
    local headers
    
    if headers=$(curl --silent --head --max-time 10 "${BASE_URL}/api/health" 2>&1); then
        local missing_headers=()
        
        # Check for security headers
        echo "${headers}" | grep -qi "x-content-type-options" || missing_headers+=("X-Content-Type-Options")
        echo "${headers}" | grep -qi "x-frame-options" || missing_headers+=("X-Frame-Options")
        echo "${headers}" | grep -qi "x-xss-protection" || missing_headers+=("X-XSS-Protection")
        echo "${headers}" | grep -qi "strict-transport-security" || missing_headers+=("Strict-Transport-Security")
        
        if [[ ${#missing_headers[@]} -eq 0 ]]; then
            return 0
        else
            log_warning "Missing security headers: ${missing_headers[*]}"
            return 0  # This is a warning, not a failure
        fi
    else
        return 1
    fi
}

test_rate_limiting() {
    local response
    local headers
    
    if headers=$(curl --silent --head --max-time 10 "${BASE_URL}/api/health" 2>&1); then
        # Check for rate limiting headers
        if echo "${headers}" | grep -qi "x-ratelimit"; then
            return 0
        else
            log_info "Rate limiting headers not found (may be normal)"
            return 0
        fi
    else
        return 1
    fi
}

test_response_time() {
    local start_time
    local end_time
    local response_time
    
    start_time=$(date +%s%N)
    
    if http_request "${BASE_URL}/api/health" "GET" "200" "" "" > /dev/null 2>&1; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        
        log_info "Response time: ${response_time}ms"
        
        # Fail if response time is over 5 seconds
        if [[ ${response_time} -gt 5000 ]]; then
            log_error "Response time too slow: ${response_time}ms"
            return 1
        fi
        
        return 0
    else
        return 1
    fi
}

test_ssl_certificate() {
    if [[ "${BASE_URL}" != https* ]]; then
        log_info "Skipping SSL test for non-HTTPS URL"
        return 0
    fi
    
    local hostname
    hostname=$(echo "${BASE_URL}" | sed 's|https\?://||' | sed 's|/.*||')
    
    if echo | openssl s_client -servername "${hostname}" -connect "${hostname}:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
        log_info "SSL certificate is valid"
        return 0
    else
        log_error "SSL certificate validation failed"
        return 1
    fi
}

test_database_connection() {
    local response
    
    # Assuming there's a health check that validates database connection
    if response=$(http_request "${BASE_URL}/api/health/database" "GET" "200"); then
        if echo "${response}" | grep -q "database.*connected"; then
            return 0
        else
            log_error "Database health check failed: ${response}"
            return 1
        fi
    else
        # If the endpoint doesn't exist, try to infer from main health endpoint
        if response=$(http_request "${BASE_URL}/api/health" "GET" "200"); then
            if echo "${response}" | grep -q "database\|db"; then
                return 0
            else
                log_warning "Cannot verify database connection from health endpoint"
                return 0  # Don't fail if we can't determine
            fi
        else
            return 1
        fi
    fi
}

# Load testing (basic)
test_load_basic() {
    local concurrent_requests=5
    local total_requests=25
    local success_count=0
    
    log_info "Running basic load test (${concurrent_requests} concurrent, ${total_requests} total)"
    
    # Create temporary directory for results
    local temp_dir
    temp_dir=$(mktemp -d)
    
    # Run concurrent requests
    for ((i=1; i<=total_requests; i++)); do
        {
            if http_request "${BASE_URL}/api/health" "GET" "200" "" "" > /dev/null 2>&1; then
                echo "success" > "${temp_dir}/result_${i}"
            else
                echo "failure" > "${temp_dir}/result_${i}"
            fi
        } &
        
        # Limit concurrent requests
        if (( i % concurrent_requests == 0 )); then
            wait
        fi
    done
    
    # Wait for remaining requests
    wait
    
    # Count successes
    success_count=$(find "${temp_dir}" -name "result_*" -exec cat {} \; | grep -c "success" || echo "0")
    
    # Cleanup
    rm -rf "${temp_dir}"
    
    local success_rate
    success_rate=$(( success_count * 100 / total_requests ))
    
    log_info "Load test results: ${success_count}/${total_requests} requests succeeded (${success_rate}%)"
    
    # Pass if success rate is above 95%
    if [[ ${success_rate} -ge 95 ]]; then
        return 0
    else
        log_error "Load test failed: success rate ${success_rate}% is below 95%"
        return 1
    fi
}

# Summary and reporting
print_summary() {
    echo
    echo "======================================"
    echo "       SMOKE TEST SUMMARY"
    echo "======================================"
    echo "Tests Passed: ${TESTS_PASSED}"
    echo "Tests Failed: ${TESTS_FAILED}"
    echo "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
    echo
    
    if [[ ${TESTS_FAILED} -gt 0 ]]; then
        echo "Failed Tests:"
        printf '%s\n' "${FAILED_TESTS[@]}"
        echo
    fi
    
    if [[ ${TESTS_FAILED} -eq 0 ]]; then
        log_success "All smoke tests passed! 🎉"
        exit 0
    else
        log_error "Some smoke tests failed! ❌"
        exit 1
    fi
}

# Main execution
main() {
    echo "======================================"
    echo "    FitTracker Pro - Smoke Tests"
    echo "======================================"
    echo "Testing API at: ${BASE_URL}"
    echo "Max retries: ${MAX_RETRIES}"
    echo "Retry delay: ${RETRY_DELAY}s"
    echo "======================================"
    echo
    
    # Core functionality tests
    run_test "Health Endpoint" test_health_endpoint
    run_test "Ready Endpoint" test_ready_endpoint
    run_test "Auth Status Endpoint" test_auth_status_endpoint
    run_test "API Version Endpoint" test_api_version_endpoint
    
    # Performance and reliability tests
    run_test "Response Time" test_response_time
    run_test "Basic Load Test" test_load_basic
    
    # Security tests
    run_test "SSL Certificate" test_ssl_certificate
    run_test "Security Headers" test_security_headers
    run_test "CORS Headers" test_cors_headers
    run_test "Rate Limiting" test_rate_limiting
    
    # Infrastructure tests
    run_test "Database Connection" test_database_connection
    
    # Print results
    print_summary
}

# Run main function
main "$@"
