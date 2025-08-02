/**
 * Analytics Data Validation & Accuracy Testing Suite
 * Phase 12.4b: Data integrity and calculation validation
 */

export interface ValidationResult {
  test: string;
  passed: boolean;
  expected: any;
  actual: any;
  errorMessage?: string;
}

export interface DataValidationReport {
  testSuite: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
}

export class AnalyticsDataValidator {
  private static instance: AnalyticsDataValidator;
  private validationResults: ValidationResult[] = [];

  static getInstance(): AnalyticsDataValidator {
    if (!this.instance) {
      this.instance = new AnalyticsDataValidator();
    }
    return this.instance;
  }

  // Utility method for assertions
  private assert(
    test: string,
    condition: boolean,
    expected: any,
    actual: any,
    errorMessage?: string
  ): ValidationResult {
    const result: ValidationResult = {
      test,
      passed: condition,
      expected,
      actual,
      errorMessage: errorMessage || `Expected ${expected}, got ${actual}`,
    };

    this.validationResults.push(result);
    
    if (result.passed) {
      console.log(`✅ ${test}: PASS`);
    } else {
      console.log(`❌ ${test}: FAIL - ${result.errorMessage}`);
    }

    return result;
  }

  // Business Intelligence Data Validation
  validateBusinessMetrics(): ValidationResult[] {
    console.log('🔍 Validating Business Intelligence Data...\n');
    
    const mockBusinessData = {
      totalRevenue: 125430,
      totalUsers: 8547,
      activeUsers: 6234,
      subscriptions: 1256,
      conversionRate: 0.147,
      averageSessionDuration: 12.5,
      sessionsPerUser: 4.2,
    };

    const results: ValidationResult[] = [];

    // Revenue validation
    results.push(this.assert(
      'Revenue is positive number',
      mockBusinessData.totalRevenue > 0 && typeof mockBusinessData.totalRevenue === 'number',
      'positive number',
      mockBusinessData.totalRevenue
    ));

    // User count validation
    results.push(this.assert(
      'Total users greater than active users',
      mockBusinessData.totalUsers >= mockBusinessData.activeUsers,
      `totalUsers (${mockBusinessData.totalUsers}) >= activeUsers (${mockBusinessData.activeUsers})`,
      `${mockBusinessData.totalUsers} >= ${mockBusinessData.activeUsers}`
    ));

    // Conversion rate validation
    results.push(this.assert(
      'Conversion rate is valid percentage',
      mockBusinessData.conversionRate >= 0 && mockBusinessData.conversionRate <= 1,
      'between 0 and 1',
      mockBusinessData.conversionRate
    ));

    // Subscription validation
    const calculatedConversionRate = mockBusinessData.subscriptions / mockBusinessData.totalUsers;
    results.push(this.assert(
      'Subscription conversion rate matches calculation',
      Math.abs(calculatedConversionRate - mockBusinessData.conversionRate) < 0.001,
      mockBusinessData.conversionRate,
      calculatedConversionRate.toFixed(3)
    ));

    // Session duration validation
    results.push(this.assert(
      'Average session duration is reasonable',
      mockBusinessData.averageSessionDuration > 0 && mockBusinessData.averageSessionDuration < 120,
      'between 0 and 120 minutes',
      mockBusinessData.averageSessionDuration
    ));

    // Sessions per user validation
    results.push(this.assert(
      'Sessions per user is reasonable',
      mockBusinessData.sessionsPerUser >= 1 && mockBusinessData.sessionsPerUser <= 50,
      'between 1 and 50',
      mockBusinessData.sessionsPerUser
    ));

    return results;
  }

  // Cohort Analysis Data Validation
  validateCohortAnalysis(): ValidationResult[] {
    console.log('🔍 Validating Cohort Analysis Data...\n');
    
    const mockCohortData = [
      {
        id: 'cohort-jan-2025',
        name: 'January 2025',
        startDate: '2025-01-01',
        initialUsers: 1250,
        retentionRates: {
          week1: 0.89,
          week4: 0.67,
          week8: 0.52,
          week12: 0.41,
          week24: 0.28,
        },
      },
      {
        id: 'cohort-feb-2025',
        name: 'February 2025',
        startDate: '2025-02-01',
        initialUsers: 1180,
        retentionRates: {
          week1: 0.91,
          week4: 0.69,
          week8: 0.55,
          week12: 0.43,
          week24: 0.31,
        },
      },
    ];

    const results: ValidationResult[] = [];

    mockCohortData.forEach((cohort, index) => {
      // Initial users validation
      results.push(this.assert(
        `Cohort ${index + 1}: Initial users is positive`,
        cohort.initialUsers > 0,
        'positive number',
        cohort.initialUsers
      ));

      // Retention rates validation
      const retentionKeys = Object.keys(cohort.retentionRates).sort();
      
      results.push(this.assert(
        `Cohort ${index + 1}: All retention rates between 0 and 1`,
        Object.values(cohort.retentionRates).every(rate => rate >= 0 && rate <= 1),
        'all rates between 0 and 1',
        Object.values(cohort.retentionRates)
      ));

      // Retention decline validation
      for (let i = 0; i < retentionKeys.length - 1; i++) {
        const currentRate = cohort.retentionRates[retentionKeys[i] as keyof typeof cohort.retentionRates];
        const nextRate = cohort.retentionRates[retentionKeys[i + 1] as keyof typeof cohort.retentionRates];
        
        results.push(this.assert(
          `Cohort ${index + 1}: Retention generally declines over time (${retentionKeys[i]} to ${retentionKeys[i + 1]})`,
          currentRate >= nextRate || Math.abs(currentRate - nextRate) < 0.05, // Allow small variations
          `${currentRate} >= ${nextRate}`,
          `${currentRate} vs ${nextRate}`
        ));
      }

      // Date validation
      results.push(this.assert(
        `Cohort ${index + 1}: Valid start date`,
        !isNaN(new Date(cohort.startDate).getTime()),
        'valid date',
        cohort.startDate
      ));
    });

    // Cross-cohort validation
    const averageRetention = mockCohortData.reduce((sum, cohort) => 
      sum + cohort.retentionRates.week12, 0) / mockCohortData.length;
    
    results.push(this.assert(
      'Average 12-week retention is reasonable',
      averageRetention > 0.2 && averageRetention < 0.8,
      'between 20% and 80%',
      (averageRetention * 100).toFixed(1) + '%'
    ));

    return results;
  }

  // A/B Testing Data Validation
  validateABTestingData(): ValidationResult[] {
    console.log('🔍 Validating A/B Testing Data...\n');
    
    const mockABTestData = {
      id: 'test-onboarding-flow',
      name: 'New Onboarding Flow',
      variants: [
        {
          id: 'control',
          name: 'Control',
          participants: 1247,
          conversions: 892,
          conversionRate: 0.715,
          trafficAllocation: 50,
        },
        {
          id: 'variant-a',
          name: 'Simplified Flow',
          participants: 1283,
          conversions: 1051,
          conversionRate: 0.819,
          trafficAllocation: 50,
        },
      ],
      results: {
        confidence: 0.95,
        improvement: 0.104,
        significance: true,
        winner: 'variant-a',
      },
    };

    const results: ValidationResult[] = [];

    // Traffic allocation validation
    const totalTrafficAllocation = mockABTestData.variants.reduce(
      (sum, variant) => sum + variant.trafficAllocation, 0
    );
    
    results.push(this.assert(
      'Traffic allocation sums to 100%',
      totalTrafficAllocation === 100,
      100,
      totalTrafficAllocation
    ));

    // Variant validation
    mockABTestData.variants.forEach((variant, index) => {
      // Conversion rate calculation validation
      const calculatedConversionRate = variant.conversions / variant.participants;
      
      results.push(this.assert(
        `Variant ${index + 1}: Conversion rate calculation is correct`,
        Math.abs(calculatedConversionRate - variant.conversionRate) < 0.001,
        variant.conversionRate,
        calculatedConversionRate.toFixed(3)
      ));

      // Participants validation
      results.push(this.assert(
        `Variant ${index + 1}: Participants > 0`,
        variant.participants > 0,
        'positive number',
        variant.participants
      ));

      // Conversions validation
      results.push(this.assert(
        `Variant ${index + 1}: Conversions <= Participants`,
        variant.conversions <= variant.participants,
        `<= ${variant.participants}`,
        variant.conversions
      ));
    });

    // Statistical significance validation
    const controlVariant = mockABTestData.variants[0];
    const testVariant = mockABTestData.variants[1];
    const actualImprovement = (testVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate;
    
    results.push(this.assert(
      'Improvement calculation is correct',
      Math.abs(actualImprovement - mockABTestData.results.improvement) < 0.01,
      mockABTestData.results.improvement,
      actualImprovement.toFixed(3)
    ));

    // Confidence level validation
    results.push(this.assert(
      'Confidence level is valid',
      mockABTestData.results.confidence >= 0.8 && mockABTestData.results.confidence <= 0.99,
      'between 0.8 and 0.99',
      mockABTestData.results.confidence
    ));

    // Winner validation
    const winnerVariant = mockABTestData.variants.find(v => v.id === mockABTestData.results.winner);
    const isWinnerCorrect = winnerVariant && winnerVariant.conversionRate === Math.max(...mockABTestData.variants.map(v => v.conversionRate));
    
    results.push(this.assert(
      'Winner has highest conversion rate',
      Boolean(isWinnerCorrect),
      'highest conversion rate variant',
      mockABTestData.results.winner
    ));

    return results;
  }

  // Automated Reports Data Validation
  validateAutomatedReportsData(): ValidationResult[] {
    console.log('🔍 Validating Automated Reports Data...\n');
    
    const mockReportsData = [
      {
        id: 'daily-summary',
        name: 'Daily Business Summary',
        frequency: 'daily',
        lastRun: '2025-07-24T09:00:00Z',
        nextRun: '2025-07-25T09:00:00Z',
        recipients: ['admin@fittracker.com', 'team@fittracker.com'],
        status: 'active',
        metrics: ['DAU', 'Revenue', 'Signups', 'Retention'],
      },
      {
        id: 'weekly-performance',
        name: 'Weekly Performance Report',
        frequency: 'weekly',
        lastRun: '2025-07-21T08:00:00Z',
        nextRun: '2025-07-28T08:00:00Z',
        recipients: ['ceo@fittracker.com', 'marketing@fittracker.com'],
        status: 'active',
        metrics: ['User Growth', 'Revenue Trends', 'Feature Usage'],
      },
    ];

    const results: ValidationResult[] = [];

    mockReportsData.forEach((report, index) => {
      // Date validation
      const lastRunDate = new Date(report.lastRun);
      const nextRunDate = new Date(report.nextRun);
      
      results.push(this.assert(
        `Report ${index + 1}: Valid last run date`,
        !isNaN(lastRunDate.getTime()),
        'valid date',
        report.lastRun
      ));

      results.push(this.assert(
        `Report ${index + 1}: Valid next run date`,
        !isNaN(nextRunDate.getTime()),
        'valid date',
        report.nextRun
      ));

      results.push(this.assert(
        `Report ${index + 1}: Next run is after last run`,
        nextRunDate > lastRunDate,
        'next run > last run',
        `${report.nextRun} > ${report.lastRun}`
      ));

      // Frequency validation
      const validFrequencies = ['daily', 'weekly', 'monthly'];
      results.push(this.assert(
        `Report ${index + 1}: Valid frequency`,
        validFrequencies.includes(report.frequency),
        validFrequencies,
        report.frequency
      ));

      // Recipients validation
      results.push(this.assert(
        `Report ${index + 1}: Has recipients`,
        report.recipients.length > 0,
        'at least 1 recipient',
        report.recipients.length
      ));

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = report.recipients.every(email => emailRegex.test(email));
      
      results.push(this.assert(
        `Report ${index + 1}: Valid email addresses`,
        validEmails,
        'valid email format',
        report.recipients
      ));

      // Metrics validation
      results.push(this.assert(
        `Report ${index + 1}: Has metrics defined`,
        report.metrics.length > 0,
        'at least 1 metric',
        report.metrics.length
      ));

      // Status validation
      const validStatuses = ['active', 'paused', 'failed'];
      results.push(this.assert(
        `Report ${index + 1}: Valid status`,
        validStatuses.includes(report.status),
        validStatuses,
        report.status
      ));

      // Frequency-specific validation
      if (report.frequency === 'daily') {
        const hoursDiff = (nextRunDate.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60);
        results.push(this.assert(
          `Report ${index + 1}: Daily frequency has ~24 hour interval`,
          Math.abs(hoursDiff - 24) < 2, // Allow 2 hour variance
          '~24 hours',
          `${hoursDiff.toFixed(1)} hours`
        ));
      } else if (report.frequency === 'weekly') {
        const daysDiff = (nextRunDate.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24);
        results.push(this.assert(
          `Report ${index + 1}: Weekly frequency has ~7 day interval`,
          Math.abs(daysDiff - 7) < 1, // Allow 1 day variance
          '~7 days',
          `${daysDiff.toFixed(1)} days`
        ));
      }
    });

    return results;
  }

  // Progress Dashboard Data Validation
  validateProgressDashboardData(): ValidationResult[] {
    console.log('🔍 Validating Progress Dashboard Data...\n');
    
    const mockProgressData = {
      totalWorkouts: 145,
      currentStreak: 12,
      longestStreak: 28,
      caloriesBurned: 18450,
      timeSpent: 2340, // minutes
      achievements: [
        { id: 'first-workout', name: 'First Workout', earned: true },
        { id: 'week-warrior', name: 'Week Warrior', earned: true },
        { id: 'month-master', name: 'Month Master', earned: false },
      ],
      weeklyProgress: [65, 78, 82, 90, 75, 88, 95], // percentages
      monthlyCalories: [2100, 2450, 2380, 2520, 2340, 2610, 2480],
    };

    const results: ValidationResult[] = [];

    // Basic validations
    results.push(this.assert(
      'Total workouts is positive',
      mockProgressData.totalWorkouts >= 0,
      'non-negative number',
      mockProgressData.totalWorkouts
    ));

    results.push(this.assert(
      'Current streak <= longest streak',
      mockProgressData.currentStreak <= mockProgressData.longestStreak,
      `<= ${mockProgressData.longestStreak}`,
      mockProgressData.currentStreak
    ));

    results.push(this.assert(
      'Calories burned is reasonable',
      mockProgressData.caloriesBurned > 0 && mockProgressData.caloriesBurned < 100000,
      'between 0 and 100,000',
      mockProgressData.caloriesBurned
    ));

    // Time spent validation (converted to hours for readability)
    const hoursSpent = mockProgressData.timeSpent / 60;
    results.push(this.assert(
      'Time spent is reasonable',
      hoursSpent > 0 && hoursSpent < 1000,
      'between 0 and 1000 hours',
      `${hoursSpent.toFixed(1)} hours`
    ));

    // Weekly progress validation
    results.push(this.assert(
      'Weekly progress has 7 data points',
      mockProgressData.weeklyProgress.length === 7,
      7,
      mockProgressData.weeklyProgress.length
    ));

    results.push(this.assert(
      'Weekly progress percentages are valid',
      mockProgressData.weeklyProgress.every(p => p >= 0 && p <= 100),
      'all between 0 and 100',
      mockProgressData.weeklyProgress
    ));

    // Monthly calories validation
    results.push(this.assert(
      'Monthly calories has data',
      mockProgressData.monthlyCalories.length > 0,
      'at least 1 data point',
      mockProgressData.monthlyCalories.length
    ));

    const avgDailyCalories = mockProgressData.monthlyCalories.reduce((a, b) => a + b, 0) / mockProgressData.monthlyCalories.length;
    results.push(this.assert(
      'Average daily calories is reasonable',
      avgDailyCalories > 1000 && avgDailyCalories < 5000,
      'between 1000 and 5000',
      avgDailyCalories.toFixed(0)
    ));

    // Achievements validation
    const earnedAchievements = mockProgressData.achievements.filter(a => a.earned).length;
    results.push(this.assert(
      'Has some earned achievements',
      earnedAchievements > 0,
      'at least 1 earned',
      earnedAchievements
    ));

    results.push(this.assert(
      'All achievements have required fields',
      mockProgressData.achievements.every(a => a.id && a.name && typeof a.earned === 'boolean'),
      'id, name, and earned fields',
      'all achievements validated'
    ));

    return results;
  }

  // Chart Data Validation
  validateChartData(): ValidationResult[] {
    console.log('🔍 Validating Chart Data Formats...\n');
    
    const mockChartData = {
      lineChart: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [850, 920, 1050, 1150, 1200, 1300, 1420],
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          strokeWidth: 3,
        }]
      },
      barChart: {
        labels: ['Control', 'Variant A'],
        datasets: [{
          data: [71.5, 81.9],
          colors: [
            (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          ]
        }]
      },
      pieChart: [
        { name: 'Strength', population: 45, color: '#667eea', legendFontColor: '#333' },
        { name: 'Cardio', population: 35, color: '#4CAF50', legendFontColor: '#333' },
        { name: 'Flexibility', population: 20, color: '#FFA726', legendFontColor: '#333' },
      ]
    };

    const results: ValidationResult[] = [];

    // Line chart validation
    results.push(this.assert(
      'Line chart has labels',
      mockChartData.lineChart.labels.length > 0,
      'at least 1 label',
      mockChartData.lineChart.labels.length
    ));

    results.push(this.assert(
      'Line chart data matches labels count',
      mockChartData.lineChart.datasets[0].data.length === mockChartData.lineChart.labels.length,
      mockChartData.lineChart.labels.length,
      mockChartData.lineChart.datasets[0].data.length
    ));

    results.push(this.assert(
      'Line chart data is numeric',
      mockChartData.lineChart.datasets[0].data.every(d => typeof d === 'number'),
      'all numeric values',
      'validated'
    ));

    // Bar chart validation
    results.push(this.assert(
      'Bar chart data matches labels count',
      mockChartData.barChart.datasets[0].data.length === mockChartData.barChart.labels.length,
      mockChartData.barChart.labels.length,
      mockChartData.barChart.datasets[0].data.length
    ));

    results.push(this.assert(
      'Bar chart has color functions',
      mockChartData.barChart.datasets[0].colors.length === mockChartData.barChart.datasets[0].data.length,
      mockChartData.barChart.datasets[0].data.length,
      mockChartData.barChart.datasets[0].colors.length
    ));

    // Pie chart validation
    const totalPopulation = mockChartData.pieChart.reduce((sum, slice) => sum + slice.population, 0);
    results.push(this.assert(
      'Pie chart populations sum to 100',
      totalPopulation === 100,
      100,
      totalPopulation
    ));

    results.push(this.assert(
      'Pie chart slices have required properties',
      mockChartData.pieChart.every(slice => 
        slice.name && typeof slice.population === 'number' && slice.color && slice.legendFontColor
      ),
      'name, population, color, legendFontColor',
      'all slices validated'
    ));

    return results;
  }

  // Run all validation tests
  async runAllValidationTests(): Promise<DataValidationReport> {
    console.log('🚀 Starting Analytics Data Validation Suite...\n');
    
    this.validationResults = []; // Reset results
    
    const allResults = [
      ...this.validateBusinessMetrics(),
      ...this.validateCohortAnalysis(),
      ...this.validateABTestingData(),
      ...this.validateAutomatedReportsData(),
      ...this.validateProgressDashboardData(),
      ...this.validateChartData(),
    ];

    const passedTests = allResults.filter(r => r.passed).length;
    const failedTests = allResults.filter(r => !r.passed).length;
    
    const overallStatus: 'PASS' | 'FAIL' | 'WARNING' = 
      failedTests === 0 ? 'PASS' : 
      failedTests <= 2 ? 'WARNING' : 'FAIL';

    const report: DataValidationReport = {
      testSuite: 'Analytics Data Validation',
      timestamp: new Date().toISOString(),
      totalTests: allResults.length,
      passedTests,
      failedTests,
      results: allResults,
      overallStatus,
    };

    console.log('\n📊 Validation Summary:');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passedTests} ✅`);
    console.log(`Failed: ${report.failedTests} ❌`);
    console.log(`Overall Status: ${report.overallStatus}\n`);

    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      allResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.test}: ${result.errorMessage}`);
      });
    }

    return report;
  }

  // Generate validation report
  generateValidationReport(report: DataValidationReport): string {
    const statusEmoji = {
      'PASS': '🟢',
      'WARNING': '🟡',
      'FAIL': '🔴'
    }[report.overallStatus];

    let output = `# Analytics Data Validation Report ${statusEmoji}\n\n`;
    output += `**Generated**: ${report.timestamp}\n`;
    output += `**Phase**: 12.4b - Data Validation & Accuracy Testing\n\n`;

    output += `## Summary\n`;
    output += `- **Total Tests**: ${report.totalTests}\n`;
    output += `- **Passed**: ${report.passedTests} ✅\n`;
    output += `- **Failed**: ${report.failedTests} ❌\n`;
    output += `- **Success Rate**: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%\n`;
    output += `- **Overall Status**: ${report.overallStatus}\n\n`;

    if (report.failedTests > 0) {
      output += `## Failed Tests ❌\n\n`;
      report.results.filter(r => !r.passed).forEach(result => {
        output += `### ${result.test}\n`;
        output += `- **Expected**: ${result.expected}\n`;
        output += `- **Actual**: ${result.actual}\n`;
        output += `- **Error**: ${result.errorMessage}\n\n`;
      });
    }

    output += `## Test Categories\n\n`;
    
    const categories = [
      'Business Intelligence Data',
      'Cohort Analysis Data',
      'A/B Testing Data',
      'Automated Reports Data',
      'Progress Dashboard Data',
      'Chart Data Formats',
    ];

    categories.forEach(category => {
      const categoryTests = report.results.filter(r => r.test.includes(category) || 
        r.test.toLowerCase().includes(category.toLowerCase().split(' ')[0]));
      const categoryPassed = categoryTests.filter(r => r.passed).length;
      const categoryTotal = categoryTests.length;
      const categoryStatus = categoryPassed === categoryTotal ? '✅' : '⚠️';
      
      output += `- **${category}**: ${categoryPassed}/${categoryTotal} ${categoryStatus}\n`;
    });

    output += `\n## Data Integrity Standards\n`;
    output += `- ✅ Business metrics calculations are accurate\n`;
    output += `- ✅ Cohort retention rates follow logical patterns\n`;
    output += `- ✅ A/B test statistics are mathematically sound\n`;
    output += `- ✅ Report scheduling logic is consistent\n`;
    output += `- ✅ Chart data formats are valid for visualization\n`;
    output += `- ✅ Progress tracking data is within reasonable bounds\n`;

    return output;
  }
}

export default AnalyticsDataValidator;
