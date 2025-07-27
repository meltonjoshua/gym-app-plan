#!/usr/bin/env node

const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

class TypeScriptErrorCollector {
  constructor(rootPath = '/workspaces/gym-app-plan') {
    this.rootPath = rootPath;
    this.errors = [];
  }

  async collectErrors() {
    return new Promise((resolve, reject) => {
      console.log('🔍 Collecting TypeScript errors...');
      
      const tsc = spawn('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
        cwd: this.rootPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      tsc.stdout.on('data', (data) => {
        output += data.toString();
      });

      tsc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      tsc.on('close', (code) => {
        if (code === 0) {
          console.log('✅ No TypeScript errors found!');
          resolve([]);
          return;
        }

        const allOutput = output + errorOutput;
        this.errors = this.parseTypeScriptOutput(allOutput);
        
        console.log(`📊 Found ${this.errors.length} TypeScript errors`);
        resolve(this.errors);
      });

      tsc.on('error', (error) => {
        console.error('❌ Failed to run TypeScript compiler:', error);
        reject(error);
      });
    });
  }

  parseTypeScriptOutput(output) {
    const errors = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('error TS')) {
        const error = this.parseErrorLine(line);
        if (error) {
          errors.push(error);
        }
      }
    }

    return errors;
  }

  parseErrorLine(line) {
    // Pattern: src/path/file.ts(line,column): error TScode: message
    const pattern = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/;
    const match = line.match(pattern);

    if (!match) {
      return null;
    }

    const [, file, lineStr, columnStr, severity, errorCode, message] = match;
    const lineNum = parseInt(lineStr, 10);
    const column = parseInt(columnStr, 10);

    return {
      file: file.replace(this.rootPath + '/', ''),
      line: lineNum,
      column,
      errorCode: `TS${errorCode}`,
      severity,
      message: message.trim(),
      category: this.categorizeError(errorCode, message),
      source: this.determineSource(file),
      priority: this.calculatePriority(errorCode, message, file)
    };
  }

  categorizeError(errorCode, message) {
    const code = parseInt(errorCode);
    
    if (code === 2307) return 'missing_module';
    if (code === 2339) return 'missing_property';
    if (code === 2322) return 'type_assignment';
    if (code === 2554) return 'wrong_arguments';
    if (code === 2345) return 'type_mismatch';
    if (code === 2551) return 'missing_method';
    if (code === 2304) return 'missing_identifier';
    if (code === 2749) return 'type_usage';
    if (code === 2352) return 'unsafe_conversion';
    if (code === 7006) return 'implicit_any';
    if (code === 18048) return 'possibly_undefined';
    if (code === 2503) return 'missing_namespace';
    if (code === 2604) return 'jsx_error';
    if (code === 2786) return 'jsx_component_error';
    if (code === 2693) return 'enum_usage';

    return 'other';
  }

  determineSource(file) {
    if (file.includes('computerVision')) return 'computer_vision';
    if (file.includes('formAnalysis')) return 'form_analysis';
    if (file.includes('nutritionAI')) return 'nutrition_ai';
    if (file.includes('sleepAnalysis')) return 'sleep_ai';
    if (file.includes('analytics')) return 'analytics';
    if (file.includes('growthHacking')) return 'growth_service';
    if (file.includes('recovery')) return 'recovery_engine';
    if (file.includes('userSegmentation')) return 'user_segmentation';
    if (file.includes('Camera')) return 'camera_component';
    if (file.includes('screens')) return 'screens';
    if (file.includes('components')) return 'components';
    if (file.includes('services')) return 'services';
    if (file.includes('utils')) return 'utils';
    return 'other';
  }

  calculatePriority(errorCode, message, file) {
    let priority = 0;

    const highPriorityCodes = ['2307', '2339', '2304', '2604', '2786'];
    if (highPriorityCodes.includes(errorCode.replace('TS', ''))) {
      priority += 3;
    }

    const criticalFiles = [
      'computerVision', 'formAnalysisEngine', 'nutritionAI', 
      'sleepAnalysisAI', 'aiRecommendationEngine'
    ];
    if (criticalFiles.some(cf => file.includes(cf))) {
      priority += 2;
    }

    if (message.includes('Cannot find module') || 
        message.includes('Property') && message.includes('does not exist')) {
      priority += 1;
    }

    return priority;
  }

  generateSummary() {
    const errorsByFile = {};
    const errorsByType = {};
    const errorsBySource = {};

    for (const error of this.errors) {
      errorsByFile[error.file] = (errorsByFile[error.file] || 0) + 1;
      errorsByType[error.category] = (errorsByType[error.category] || 0) + 1;
      errorsBySource[error.source] = (errorsBySource[error.source] || 0) + 1;
    }

    const sortedErrors = [...this.errors].sort((a, b) => b.priority - a.priority);
    
    const highPriorityErrors = sortedErrors.filter(e => e.priority >= 4);
    const fixableErrors = sortedErrors.filter(e => 
      ['missing_module', 'missing_property', 'missing_method', 'missing_identifier']
        .includes(e.category)
    );
    const complexErrors = sortedErrors.filter(e => 
      ['type_assignment', 'unsafe_conversion', 'jsx_component_error']
        .includes(e.category)
    );

    return {
      totalErrors: this.errors.length,
      errorsByFile,
      errorsByType,
      errorsBySource,
      highPriorityErrors,
      fixableErrors,
      complexErrors
    };
  }

  generateFixPlan() {
    const summary = this.generateSummary();
    let plan = '# TypeScript Error Fix Plan\\n\\n';
    
    plan += `## Summary\\n`;
    plan += `- **Total Errors:** ${summary.totalErrors}\\n`;
    plan += `- **High Priority:** ${summary.highPriorityErrors.length}\\n`;
    plan += `- **Easy Fixes:** ${summary.fixableErrors.length}\\n`;
    plan += `- **Complex Fixes:** ${summary.complexErrors.length}\\n\\n`;

    plan += `## Errors by Source\\n`;
    const sortedSources = Object.entries(summary.errorsBySource)
      .sort(([, a], [, b]) => b - a);
    for (const [source, count] of sortedSources) {
      plan += `- **${source}:** ${count} errors\\n`;
    }

    plan += `\\n## Top Errors to Fix First\\n\\n`;

    // Show highest priority errors
    const topErrors = summary.highPriorityErrors.slice(0, 10);
    for (let i = 0; i < topErrors.length; i++) {
      const error = topErrors[i];
      plan += `### ${i + 1}. ${error.file}:${error.line}\\n`;
      plan += `- **Category:** ${error.category}\\n`;
      plan += `- **Error:** ${error.message}\\n`;
      plan += `- **Priority:** ${error.priority}\\n\\n`;
    }

    // Show easy fixes
    plan += `## Easy Fixes (${summary.fixableErrors.length} total)\\n\\n`;
    const easyFixes = summary.fixableErrors.slice(0, 15);
    for (const error of easyFixes) {
      plan += `- **${error.file}:${error.line}** - ${error.category}: ${error.message}\\n`;
    }

    return plan;
  }

  async printQuickSummary() {
    console.log('\\n🔍 TypeScript Error Analysis');
    console.log('============================');
    
    const summary = this.generateSummary();
    
    console.log(`📊 Total Errors: ${summary.totalErrors}`);
    console.log(`🔥 High Priority: ${summary.highPriorityErrors.length}`);
    console.log(`🛠️  Easy Fixes: ${summary.fixableErrors.length}`);
    console.log(`⚠️  Complex: ${summary.complexErrors.length}`);
    
    console.log('\\n📁 Top Error Sources:');
    const topSources = Object.entries(summary.errorsBySource)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    for (const [source, count] of topSources) {
      console.log(`   ${source}: ${count} errors`);
    }
    
    console.log('\\n🏷️  Error Categories:');
    const topCategories = Object.entries(summary.errorsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    for (const [category, count] of topCategories) {
      console.log(`   ${category}: ${count} errors`);
    }

    if (summary.highPriorityErrors.length > 0) {
      console.log('\\n🚨 High Priority Errors:');
      for (const error of summary.highPriorityErrors.slice(0, 5)) {
        console.log(`   ${error.file}:${error.line} - ${error.category}`);
      }
    }

    if (summary.fixableErrors.length > 0) {
      console.log('\\n🚀 Quick Wins (Easy Fixes):');
      for (const error of summary.fixableErrors.slice(0, 5)) {
        console.log(`   ${error.file}:${error.line} - ${error.category}`);
      }
    }
  }

  saveResults(outputPath = '/workspaces/gym-app-plan/typescript-errors.json') {
    const results = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      errors: this.errors,
      fixPlan: this.generateFixPlan()
    };

    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    // Also save the fix plan as markdown
    const planPath = outputPath.replace('.json', '-plan.md');
    writeFileSync(planPath, this.generateFixPlan());
    
    console.log(`\\n📄 Results saved to: ${outputPath}`);
    console.log(`📋 Fix plan saved to: ${planPath}`);
  }
}

async function main() {
  const collector = new TypeScriptErrorCollector();
  
  try {
    await collector.collectErrors();
    await collector.printQuickSummary();
    collector.saveResults();
    
    console.log('\\n✅ Error collection complete!');
    console.log('📋 Check typescript-errors-plan.md for detailed fix instructions');
    
  } catch (error) {
    console.error('❌ Error collection failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TypeScriptErrorCollector };
