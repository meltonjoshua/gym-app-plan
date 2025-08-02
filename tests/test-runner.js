#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes
  retries: 2,
  parallel: true,
  coverage: true,
  verbose: true
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging functions
function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}❌${colors.reset} ${message}`);
}

function logHeader(message) {
  console.log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);
  console.log('='.repeat(message.length));
}

// Test suite definitions
const testSuites = [
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=tests/unit', '--coverage'],
    description: 'Running unit tests for individual components'
  },
  {
    name: 'Integration Tests',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=tests/integration', '--runInBand'],
    description: 'Running integration tests for microservices'
  },
  {
    name: 'API Tests',
    command: 'node',
    args: ['tests/api/postman-tests.js'],
    description: 'Running API endpoint tests with Newman/Postman'
  },
  {
    name: 'Performance Tests',
    command: 'k6',
    args: ['run', 'tests/performance/load-test.js'],
    description: 'Running performance and load tests with k6'
  }
];

// Service management
const services = [
  {
    name: 'API Gateway',
    path: 'apps/microservices/api-gateway',
    port: 3000,
    command: 'npm',
    args: ['start']
  },
  {
    name: 'User Service',
    path: 'apps/microservices/user-service',
    port: 3001,
    command: 'npm',
    args: ['start']
  },
  {
    name: 'Workout Service',
    path: 'apps/microservices/workout-service',
    port: 3002,
    command: 'npm',
    args: ['start']
  },
  {
    name: 'AI Service',
    path: 'apps/microservices/ai-service',
    port: 3003,
    command: 'npm',
    args: ['start']
  },
  {
    name: 'Notification Service',
    path: 'apps/microservices/notification-service',
    port: 3004,
    command: 'npm',
    args: ['start']
  }
];

// Utility functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      cwd: options.cwd || process.cwd(),
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject({ code, stdout, stderr });
      }
    });

    proc.on('error', (error) => {
      reject({ error, stdout, stderr });
    });
  });
}

async function checkServiceHealth(service) {
  try {
    const response = await fetch(`http://localhost:${service.port}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function waitForServices(timeout = 60000) {
  logInfo('Waiting for all services to be ready...');
  
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < timeout) {
    const healthChecks = await Promise.all(
      services.map(async (service) => {
        const isHealthy = await checkServiceHealth(service);
        if (isHealthy) {
          logSuccess(`${service.name} is ready on port ${service.port}`);
        }
        return { service: service.name, healthy: isHealthy };
      })
    );
    
    const allHealthy = healthChecks.every(check => check.healthy);
    
    if (allHealthy) {
      logSuccess('All services are ready!');
      return true;
    }
    
    const unhealthyServices = healthChecks
      .filter(check => !check.healthy)
      .map(check => check.service);
    
    logInfo(`Waiting for services: ${unhealthyServices.join(', ')}`);
    await sleep(checkInterval);
  }
  
  logError('Timeout waiting for services to be ready');
  return false;
}

async function startServices() {
  logHeader('Starting Microservices');
  
  const serviceProcesses = [];
  
  for (const service of services) {
    logInfo(`Starting ${service.name}...`);
    
    try {
      const proc = spawn(service.command, service.args, {
        stdio: 'pipe',
        shell: true,
        cwd: path.join(process.cwd(), service.path),
        detached: true
      });
      
      serviceProcesses.push({ name: service.name, process: proc, port: service.port });
      
      // Give each service a moment to start
      await sleep(2000);
      
    } catch (error) {
      logError(`Failed to start ${service.name}: ${error.message}`);
      throw error;
    }
  }
  
  // Wait for all services to be healthy
  const allReady = await waitForServices();
  
  if (!allReady) {
    throw new Error('Not all services started successfully');
  }
  
  return serviceProcesses;
}

async function stopServices(serviceProcesses) {
  logHeader('Stopping Services');
  
  for (const serviceInfo of serviceProcesses) {
    try {
      logInfo(`Stopping ${serviceInfo.name}...`);
      
      if (serviceInfo.process && !serviceInfo.process.killed) {
        serviceInfo.process.kill('SIGTERM');
        
        // Wait a moment for graceful shutdown
        await sleep(2000);
        
        // Force kill if still running
        if (!serviceInfo.process.killed) {
          serviceInfo.process.kill('SIGKILL');
        }
      }
      
      logSuccess(`${serviceInfo.name} stopped`);
    } catch (error) {
      logWarning(`Failed to stop ${serviceInfo.name}: ${error.message}`);
    }
  }
}

async function runTestSuite(suite) {
  logHeader(`${suite.name}`);
  logInfo(suite.description);
  
  try {
    const startTime = Date.now();
    
    await runCommand(suite.command, suite.args, {
      timeout: TEST_CONFIG.timeout
    });
    
    const duration = Date.now() - startTime;
    logSuccess(`${suite.name} completed in ${duration}ms`);
    
    return { name: suite.name, success: true, duration };
    
  } catch (error) {
    const duration = Date.now() - Date.now();
    logError(`${suite.name} failed: ${error.code || error.message}`);
    
    if (error.stderr) {
      console.log('\nError Output:');
      console.log(error.stderr);
    }
    
    return { name: suite.name, success: false, duration, error };
  }
}

async function setupTestEnvironment() {
  logHeader('Setting Up Test Environment');
  
  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'tests', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    logInfo('Created reports directory');
  }
  
  // Install dependencies if needed
  try {
    logInfo('Checking dependencies...');
    await runCommand('npm', ['install'], { silent: true });
    logSuccess('Dependencies verified');
  } catch (error) {
    logWarning('Failed to verify dependencies');
  }
  
  // Check for required tools
  const requiredTools = [
    { name: 'Node.js', command: 'node', args: ['--version'] },
    { name: 'npm', command: 'npm', args: ['--version'] },
    { name: 'k6', command: 'k6', args: ['version'] }
  ];
  
  for (const tool of requiredTools) {
    try {
      await runCommand(tool.command, tool.args, { silent: true });
      logSuccess(`${tool.name} is available`);
    } catch (error) {
      logWarning(`${tool.name} is not available - some tests may fail`);
    }
  }
}

async function generateTestReport(results) {
  logHeader('Generating Test Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalSuites: results.length,
    passedSuites: results.filter(r => r.success).length,
    failedSuites: results.filter(r => !r.success).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    results: results
  };
  
  // Generate JSON report
  const jsonReport = JSON.stringify(report, null, 2);
  const jsonPath = path.join(process.cwd(), 'tests', 'reports', 'test-summary.json');
  fs.writeFileSync(jsonPath, jsonReport);
  logSuccess(`JSON report saved to ${jsonPath}`);
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  const htmlPath = path.join(process.cwd(), 'tests', 'reports', 'test-summary.html');
  fs.writeFileSync(htmlPath, htmlReport);
  logSuccess(`HTML report saved to ${htmlPath}`);
  
  // Print summary
  logHeader('Test Summary');
  console.log(`📊 Total Test Suites: ${report.totalSuites}`);
  console.log(`✅ Passed: ${report.passedSuites}`);
  console.log(`❌ Failed: ${report.failedSuites}`);
  console.log(`⏱️  Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
  console.log(`📄 Success Rate: ${((report.passedSuites / report.totalSuites) * 100).toFixed(1)}%`);
  
  if (report.failedSuites > 0) {
    console.log('\n❌ Failed Test Suites:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.name}: ${result.error?.message || 'Unknown error'}`);
    });
  }
  
  return report;
}

function generateHtmlReport(report) {
  const successRate = ((report.passedSuites / report.totalSuites) * 100).toFixed(1);
  const statusClass = report.failedSuites === 0 ? 'success' : 'warning';
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Gym App Test Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #eee;
        }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .metric { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            border: 1px solid #e9ecef;
        }
        .metric h3 { 
            margin: 0 0 10px 0; 
            color: #495057; 
        }
        .metric .value { 
            font-size: 2em; 
            font-weight: bold; 
            color: #007bff;
        }
        .success { color: #28a745 !important; }
        .warning { color: #ffc107 !important; }
        .danger { color: #dc3545 !important; }
        .results-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        .results-table th, .results-table td { 
            border: 1px solid #dee2e6; 
            padding: 12px; 
            text-align: left;
        }
        .results-table th { 
            background-color: #f8f9fa; 
            font-weight: 600;
        }
        .status-badge { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 0.85em; 
            font-weight: bold;
        }
        .badge-success { 
            background-color: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb;
        }
        .badge-failure { 
            background-color: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb;
        }
        .timestamp { 
            color: #6c757d; 
            font-size: 0.9em; 
            text-align: center; 
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏋️ Gym App Microservices Test Report</h1>
            <p>Comprehensive testing results for the gym application microservices architecture</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Test Suites</h3>
                <div class="value">${report.totalSuites}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value success">${report.passedSuites}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value ${report.failedSuites > 0 ? 'danger' : 'success'}">${report.failedSuites}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value ${statusClass}">${successRate}%</div>
            </div>
            <div class="metric">
                <h3>Total Duration</h3>
                <div class="value">${(report.totalDuration / 1000).toFixed(2)}s</div>
            </div>
        </div>
        
        <h2>Test Suite Results</h2>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Test Suite</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                ${report.results.map(result => `
                    <tr>
                        <td><strong>${result.name}</strong></td>
                        <td>
                            <span class="status-badge ${result.success ? 'badge-success' : 'badge-failure'}">
                                ${result.success ? '✅ PASSED' : '❌ FAILED'}
                            </span>
                        </td>
                        <td>${(result.duration / 1000).toFixed(2)}s</td>
                        <td>${result.error ? result.error.message || 'Test suite failed' : 'All tests passed successfully'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="timestamp">
            Report generated on ${new Date(report.timestamp).toLocaleString()}
        </div>
    </div>
</body>
</html>
  `;
}

// Main test runner
async function runFullTestSuite() {
  try {
    logHeader('🏋️ Gym App Comprehensive Test Suite');
    console.log('Testing microservices architecture with full validation\n');
    
    // Setup
    await setupTestEnvironment();
    
    // Start services
    const serviceProcesses = await startServices();
    
    try {
      // Wait a bit more for services to stabilize
      await sleep(5000);
      
      // Run all test suites
      const results = [];
      
      if (TEST_CONFIG.parallel) {
        logInfo('Running test suites in parallel...');
        const testPromises = testSuites.map(suite => runTestSuite(suite));
        const testResults = await Promise.allSettled(testPromises);
        
        testResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              name: testSuites[index].name,
              success: false,
              duration: 0,
              error: result.reason
            });
          }
        });
      } else {
        logInfo('Running test suites sequentially...');
        for (const suite of testSuites) {
          const result = await runTestSuite(suite);
          results.push(result);
          
          // Break on failure if not configured to continue
          if (!result.success && TEST_CONFIG.bail) {
            break;
          }
        }
      }
      
      // Generate report
      const report = await generateTestReport(results);
      
      // Determine overall success
      const allPassed = results.every(r => r.success);
      
      if (allPassed) {
        logSuccess('🎉 All tests passed! Microservices architecture is fully functional.');
        return true;
      } else {
        logError('⚠️ Some tests failed. Please review the results and fix issues.');
        return false;
      }
      
    } finally {
      // Always stop services
      await stopServices(serviceProcesses);
    }
    
  } catch (error) {
    logError(`Test suite execution failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🏋️ Gym App Test Runner

Usage: node test-runner.js [options]

Options:
  --help, -h          Show this help message
  --sequential        Run tests sequentially instead of parallel
  --no-coverage       Skip code coverage collection
  --bail              Stop on first test failure
  --timeout <ms>      Set test timeout (default: 300000)
  --retries <n>       Set number of retries (default: 2)

Test Suites:
  - Unit Tests: Individual component testing
  - Integration Tests: Microservice integration testing  
  - API Tests: REST API endpoint validation
  - Performance Tests: Load and stress testing

Examples:
  node test-runner.js                    # Run all tests in parallel
  node test-runner.js --sequential       # Run tests one by one
  node test-runner.js --bail             # Stop on first failure
  node test-runner.js --timeout 600000   # 10 minute timeout
`);
    process.exit(0);
  }
  
  // Parse command line arguments
  if (args.includes('--sequential')) {
    TEST_CONFIG.parallel = false;
  }
  
  if (args.includes('--no-coverage')) {
    TEST_CONFIG.coverage = false;
  }
  
  if (args.includes('--bail')) {
    TEST_CONFIG.bail = true;
  }
  
  const timeoutIndex = args.indexOf('--timeout');
  if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
    TEST_CONFIG.timeout = parseInt(args[timeoutIndex + 1]);
  }
  
  const retriesIndex = args.indexOf('--retries');
  if (retriesIndex !== -1 && args[retriesIndex + 1]) {
    TEST_CONFIG.retries = parseInt(args[retriesIndex + 1]);
  }
  
  // Run the test suite
  runFullTestSuite()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runFullTestSuite,
  runTestSuite,
  startServices,
  stopServices,
  generateTestReport
};
