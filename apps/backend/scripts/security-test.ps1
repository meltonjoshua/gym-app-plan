# FitTracker Security & Compliance Testing Suite (PowerShell)
# This script performs comprehensive security testing and compliance validation

param(
    [string]$ApiBaseUrl = "http://localhost:5000",
    [string]$OutputDir = "./security-test-results"
)

# Create output directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportFile = "$OutputDir/security-report-$timestamp.json"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "FitTracker Security and Compliance Testing Suite" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize report
$report = @{
    testSuite = "FitTracker Security and Compliance"
    timestamp = (Get-Date).ToString("o")
    apiBaseUrl = $ApiBaseUrl
    tests = @{}
}

# Helper functions
function Test-SSLConfiguration {
    Write-Host "TEST: Testing SSL/TLS Configuration" -ForegroundColor Blue
    
    if ($ApiBaseUrl.StartsWith("https://")) {
        try {
            $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/health" -UseBasicParsing -TimeoutSec 10
            Write-Host "PASS: SSL connection successful" -ForegroundColor Green
            $report.tests.sslConfiguration = @{
                status = "pass"
                message = "SSL connection successful"
            }
        }
        catch {
            Write-Host "FAIL: SSL connection failed" -ForegroundColor Red
            $report.tests.sslConfiguration = @{
                status = "fail"
                message = "SSL connection failed: $($_.Exception.Message)"
            }
        }
    }
    else {
        Write-Host "WARN: Testing HTTP endpoint - SSL not configured" -ForegroundColor Yellow
        $report.tests.sslConfiguration = @{
            status = "warn"
            message = "HTTP endpoint - SSL not configured"
        }
    }
}

function Test-AuthenticationSecurity {
    Write-Host "TEST: Testing Authentication Security" -ForegroundColor Blue
    
    # Test weak password rejection
    try {
        $body = @{
            email = "test@test.com"
            password = "123"
            firstName = "Test"
            lastName = "User"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        Write-Host "[FAIL] Weak password accepted" -ForegroundColor Red
        $report.tests.passwordPolicy = @{
            status = "fail"
            message = "Weak passwords are accepted"
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "[PASS] Weak password rejected" -ForegroundColor Green
            $report.tests.passwordPolicy = @{
                status = "pass"
                message = "Weak passwords are rejected"
            }
        }
        else {
            Write-Host "[WARN] Unexpected response to weak password" -ForegroundColor Yellow
            $report.tests.passwordPolicy = @{
                status = "warn"
                message = "Unexpected response: $($_.Exception.Response.StatusCode)"
            }
        }
    }
    
    # Test SQL injection protection
    try {
        $body = @{
            email = "admin@test.com' OR '1'='1"
            password = "password"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        Write-Host "[FAIL] SQL injection vulnerability detected" -ForegroundColor Red
        $report.tests.sqlInjectionProtection = @{
            status = "fail"
            message = "SQL injection vulnerability detected"
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 401) {
            Write-Host "[PASS] SQL injection attempt blocked" -ForegroundColor Green
            $report.tests.sqlInjectionProtection = @{
                status = "pass"
                message = "SQL injection attempts are blocked"
            }
        }
    }
}

function Test-RateLimiting {
    Write-Host "[TEST] Testing Rate Limiting" -ForegroundColor Blue
    
    $rateLimitHit = $false
    $body = @{
        email = "test@example.com"
        password = "password"
    } | ConvertTo-Json
    
    for ($i = 1; $i -le 15; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                $rateLimitHit = $true
                break
            }
        }
        Start-Sleep -Milliseconds 100
    }
    
    if ($rateLimitHit) {
        Write-Host "[PASS] Rate limiting is working" -ForegroundColor Green
        $report.tests.rateLimiting = @{
            status = "pass"
            message = "Rate limiting is active"
        }
    }
    else {
        Write-Host "[WARN] Rate limiting not triggered or too lenient" -ForegroundColor Yellow
        $report.tests.rateLimiting = @{
            status = "warn"
            message = "Rate limiting not triggered in test"
        }
    }
}

function Test-InputValidation {
    Write-Host "[TEST] Testing Input Validation" -ForegroundColor Blue
    
    # Test XSS protection
    try {
        $body = @{
            email = "test@test.com"
            password = "Password123!"
            firstName = '<script>alert("xss")</script>'
            lastName = "User"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        Write-Host "[FAIL] XSS vulnerability detected" -ForegroundColor Red
        $report.tests.xssProtection = @{
            status = "fail"
            message = "XSS vulnerability detected"
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "[PASS] XSS payload rejected" -ForegroundColor Green
            $report.tests.xssProtection = @{
                status = "pass"
                message = "XSS payloads are filtered"
            }
        }
    }
}

function Test-SecurityHeaders {
    Write-Host "[TEST] Testing Security Headers" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/health" -Method GET -UseBasicParsing
        $headers = $response.Headers
        
        $securityHeaders = @(
            "X-Frame-Options",
            "X-Content-Type-Options", 
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Content-Security-Policy"
        )
        
        $presentHeaders = 0
        foreach ($header in $securityHeaders) {
            if ($headers.ContainsKey($header)) {
                $presentHeaders++
            }
        }
        
        if ($presentHeaders -ge 3) {
            Write-Host "[PASS] Security headers present ($presentHeaders/$($securityHeaders.Count))" -ForegroundColor Green
            $report.tests.securityHeaders = @{
                status = "pass"
                message = "$presentHeaders of $($securityHeaders.Count) security headers present"
            }
        }
        else {
            Write-Host "[FAIL] Missing security headers ($presentHeaders/$($securityHeaders.Count))" -ForegroundColor Red
            $report.tests.securityHeaders = @{
                status = "fail"
                message = "Only $presentHeaders of $($securityHeaders.Count) security headers present"
            }
        }
    }
    catch {
        Write-Host "[WARN] Could not test security headers" -ForegroundColor Yellow
        $report.tests.securityHeaders = @{
            status = "warn"
            message = "Could not test security headers: $($_.Exception.Message)"
        }
    }
}

function Test-EndpointProtection {
    Write-Host "TEST: Testing API Endpoint Security" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/users/profile" -Method GET -UseBasicParsing
        Write-Host "[FAIL] Unprotected sensitive endpoints detected" -ForegroundColor Red
        $report.tests.endpointProtection = @{
            status = "fail"
            message = "Sensitive endpoints accessible without authentication"
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "[PASS] Protected endpoints require authentication" -ForegroundColor Green
            $report.tests.endpointProtection = @{
                status = "pass"
                message = "Protected endpoints require authentication"
            }
        }
    }
}

function Test-GDPRCompliance {
    Write-Host "[TEST] Testing GDPR Compliance" -ForegroundColor Blue
    
    try {
        $privacyResponse = Invoke-WebRequest -Uri "$ApiBaseUrl/api/legal/privacy-policy" -Method GET -UseBasicParsing
        $privacyPass = $true
        Write-Host "[PASS] Privacy policy accessible" -ForegroundColor Green
    }
    catch {
        $privacyPass = $false
        Write-Host "[FAIL] Privacy policy not accessible" -ForegroundColor Red
    }
    
    try {
        $termsResponse = Invoke-WebRequest -Uri "$ApiBaseUrl/api/legal/terms-of-service" -Method GET -UseBasicParsing
        $termsPass = $true
        Write-Host "[PASS] Terms of service accessible" -ForegroundColor Green
    }
    catch {
        $termsPass = $false
        Write-Host "[FAIL] Terms of service not accessible" -ForegroundColor Red
    }
    
    if ($privacyPass -and $termsPass) {
        $report.tests.gdprCompliance = @{
            status = "pass"
            message = "Privacy policy and terms accessible"
        }
    }
    else {
        $report.tests.gdprCompliance = @{
            status = "fail"
            message = "Missing privacy policy or terms of service"
        }
    }
}

function Test-DataValidation {
    Write-Host "[TEST] Testing Data Validation" -ForegroundColor Blue
    
    # Test invalid email
    try {
        $body = @{
            email = "invalid-email"
            password = "Password123!"
            firstName = "Test"
            lastName = "User"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        Write-Host "[FAIL] Invalid email format accepted" -ForegroundColor Red
        $emailValidation = $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "[PASS] Invalid email format rejected" -ForegroundColor Green
            $emailValidation = $true
        }
    }
    
    # Test missing required fields
    try {
        $body = @{
            email = "test@example.com"
            password = "Password123!"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        Write-Host "[FAIL] Missing required fields accepted" -ForegroundColor Red
        $requiredValidation = $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "[PASS] Missing required fields rejected" -ForegroundColor Green
            $requiredValidation = $true
        }
    }
    
    if ($emailValidation -and $requiredValidation) {
        $report.tests.dataValidation = @{
            status = "pass"
            message = "Input validation working properly"
        }
    }
    else {
        $report.tests.dataValidation = @{
            status = "fail"
            message = "Input validation issues detected"
        }
    }
}

# Run all tests
Write-Host "Starting security test suite..." -ForegroundColor Magenta
Write-Host ""

Test-SSLConfiguration
Test-AuthenticationSecurity
Test-RateLimiting
Test-InputValidation
Test-SecurityHeaders
Test-EndpointProtection
Test-GDPRCompliance
Test-DataValidation

# Finalize report
$report.summary = @{
    completedAt = (Get-Date).ToString("o")
    totalTests = $report.tests.Count
    reportFile = $reportFile
}

# Save report
$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportFile -Encoding utf8

Write-Host ""
Write-Host "Security testing completed!" -ForegroundColor Green
Write-Host "Report saved to: $reportFile" -ForegroundColor Blue
Write-Host ""

# Generate summary
Write-Host "Test Summary:" -ForegroundColor Yellow
Write-Host "============"

$passes = ($report.tests.Values | Where-Object { $_.status -eq "pass" }).Count
$failures = ($report.tests.Values | Where-Object { $_.status -eq "fail" }).Count
$warnings = ($report.tests.Values | Where-Object { $_.status -eq "warn" }).Count

Write-Host "Passed: $passes" -ForegroundColor Green
Write-Host "Failed: $failures" -ForegroundColor Red
Write-Host "Warnings: $warnings" -ForegroundColor Yellow

if ($failures -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Security issues detected! Review the report for details." -ForegroundColor Red
    exit 1
}
else {
    Write-Host ""
    Write-Host "All security tests passed!" -ForegroundColor Green
}
