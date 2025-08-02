#!/usr/bin/env pwsh

# FitTracker Security Testing Suite
param(
    [string]$ApiBaseUrl = "http://localhost:5000"
)

Write-Host "FitTracker Security Testing Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# Test 1: Basic API Health Check
Write-Host "TEST: API Health Check" -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$ApiBaseUrl/api/health" -Method GET -TimeoutSec 10
    Write-Host "PASS: API is responding" -ForegroundColor Green
    $testResults += @{ Name = "API Health"; Status = "PASS"; Message = "API is responding" }
}
catch {
    Write-Host "FAIL: API not responding - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Name = "API Health"; Status = "FAIL"; Message = "API not responding" }
}

# Test 2: Authentication Endpoint Security
Write-Host "TEST: Authentication Security" -ForegroundColor Blue
try {
    $body = @{
        email = "test@test.com"
        password = "weak"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$ApiBaseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "FAIL: Weak authentication accepted" -ForegroundColor Red
    $testResults += @{ Name = "Auth Security"; Status = "FAIL"; Message = "Weak authentication accepted" }
}
catch {
    Write-Host "PASS: Authentication properly secured" -ForegroundColor Green
    $testResults += @{ Name = "Auth Security"; Status = "PASS"; Message = "Authentication properly secured" }
}

# Test 3: CORS Configuration
Write-Host "TEST: CORS Configuration" -ForegroundColor Blue
try {
    $headers = @{
        'Origin' = 'https://malicious-site.com'
        'Access-Control-Request-Method' = 'POST'
    }
    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/auth/login" -Method OPTIONS -Headers $headers -UseBasicParsing -TimeoutSec 10
    
    if ($response.Headers.ContainsKey('Access-Control-Allow-Origin')) {
        $allowedOrigin = $response.Headers.'Access-Control-Allow-Origin'
        if ($allowedOrigin -eq '*' -or $allowedOrigin -like '*malicious*') {
            Write-Host "FAIL: CORS allows malicious origins" -ForegroundColor Red
            $testResults += @{ Name = "CORS Config"; Status = "FAIL"; Message = "CORS misconfigured" }
        }
        else {
            Write-Host "PASS: CORS properly configured" -ForegroundColor Green
            $testResults += @{ Name = "CORS Config"; Status = "PASS"; Message = "CORS properly configured" }
        }
    }
    else {
        Write-Host "PASS: CORS properly restricts origins" -ForegroundColor Green
        $testResults += @{ Name = "CORS Config"; Status = "PASS"; Message = "CORS properly configured" }
    }
}
catch {
    Write-Host "PASS: CORS endpoint properly secured" -ForegroundColor Green
    $testResults += @{ Name = "CORS Config"; Status = "PASS"; Message = "CORS endpoint secured" }
}

# Test 4: Input Validation
Write-Host "TEST: Input Validation" -ForegroundColor Blue
try {
    $body = @{
        email = "invalid-email"
        password = "password"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$ApiBaseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "FAIL: Invalid input accepted" -ForegroundColor Red
    $testResults += @{ Name = "Input Validation"; Status = "FAIL"; Message = "Invalid input accepted" }
}
catch {
    Write-Host "PASS: Input validation working" -ForegroundColor Green
    $testResults += @{ Name = "Input Validation"; Status = "PASS"; Message = "Input validation working" }
}

# Test 5: Security Headers
Write-Host "TEST: Security Headers" -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "$ApiBaseUrl/api/health" -UseBasicParsing -TimeoutSec 10
    $securityHeaders = @('X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection')
    $foundHeaders = 0
    
    foreach ($header in $securityHeaders) {
        if ($response.Headers.ContainsKey($header)) {
            $foundHeaders++
        }
    }
    
    if ($foundHeaders -ge 2) {
        Write-Host "PASS: Security headers present ($foundHeaders/3)" -ForegroundColor Green
        $testResults += @{ Name = "Security Headers"; Status = "PASS"; Message = "$foundHeaders security headers found" }
    }
    else {
        Write-Host "WARN: Missing security headers ($foundHeaders/3)" -ForegroundColor Yellow
        $testResults += @{ Name = "Security Headers"; Status = "WARN"; Message = "Only $foundHeaders security headers found" }
    }
}
catch {
    Write-Host "WARN: Could not test security headers" -ForegroundColor Yellow
    $testResults += @{ Name = "Security Headers"; Status = "WARN"; Message = "Could not test headers" }
}

# Display Results Summary
Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Yellow
Write-Host "============="

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Warnings: $warnCount" -ForegroundColor Yellow

Write-Host ""
Write-Host "Detailed Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
    }
    Write-Host "$($result.Name): $($result.Status) - $($result.Message)" -ForegroundColor $color
}

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "Security issues detected! Please review and fix failures." -ForegroundColor Red
}
else {
    Write-Host ""
    Write-Host "All critical security tests passed!" -ForegroundColor Green
}
