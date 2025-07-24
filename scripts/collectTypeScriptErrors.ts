#!/usr/bin/env node

// ===== TYPESCRIPT ERROR COLLECTION SCRIPT =====
// Systematically capture, analyze, and log all TypeScript compilation errors

import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  errorCode: string;
  severity: 'error' | 'warning';
  message: string;
  category: string;
  source: string;
  priority: number;
}

interface ErrorSummary {
  totalErrors: number;
  errorsByFile: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsBySource: Record<string, number>;
  highPriorityErrors: TypeScriptError[];
  fixableErrors: TypeScriptError[];
  complexErrors: TypeScriptError[];
}

class TypeScriptErrorCollector {
  private errors: TypeScriptError[] = [];
  private rootPath: string;

  constructor(rootPath: string = '/workspaces/gym-app-plan') {
    this.rootPath = rootPath;
  }

  async collectErrors(): Promise<TypeScriptError[]> {
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

  private parseTypeScriptOutput(output: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
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

  private parseErrorLine(line: string): TypeScriptError | null {
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
      severity: severity as 'error' | 'warning',
      message: message.trim(),
      category: this.categorizeError(errorCode, message),
      source: this.determineSource(file),
      priority: this.calculatePriority(errorCode, message, file)
    };
  }

  private categorizeError(errorCode: string, message: string): string {
    const code = parseInt(errorCode);
    
    // Common TypeScript error categories
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

    // Categorize by message content
    if (message.includes('Cannot find module')) return 'missing_module';
    if (message.includes('Property') && message.includes('does not exist')) return 'missing_property';
    if (message.includes('Type') && message.includes('is not assignable')) return 'type_assignment';
    if (message.includes('Expected') && message.includes('arguments')) return 'wrong_arguments';
    if (message.includes('JSX')) return 'jsx_error';
    if (message.includes('namespace')) return 'missing_namespace';

    return 'other';
  }

  private determineSource(file: string): string {
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

  private calculatePriority(errorCode: string, message: string, file: string): number {
    let priority = 0;

    // High priority error codes
    const highPriorityCodes = ['2307', '2339', '2304', '2604', '2786'];
    if (highPriorityCodes.includes(errorCode.replace('TS', ''))) {
      priority += 3;
    }

    // Critical files (main AI services)
    const criticalFiles = [
      'computerVision', 'formAnalysisEngine', 'nutritionAI', 
      'sleepAnalysisAI', 'aiRecommendationEngine'
    ];
    if (criticalFiles.some(cf => file.includes(cf))) {
      priority += 2;
    }

    // Easy fixes
    if (message.includes('Cannot find module') || 
        message.includes('Property') && message.includes('does not exist')) {
      priority += 1;
    }

    return priority;
  }

  generateSummary(): ErrorSummary {
    const errorsByFile: Record<string, number> = {};
    const errorsByType: Record<string, number> = {};
    const errorsBySource: Record<string, number> = {};

    for (const error of this.errors) {
      errorsByFile[error.file] = (errorsByFile[error.file] || 0) + 1;
      errorsByType[error.category] = (errorsByType[error.category] || 0) + 1;
      errorsBySource[error.source] = (errorsBySource[error.source] || 0) + 1;
    }

    // Sort errors by priority
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

  generateFixPlan(): string {
    const summary = this.generateSummary();
    let plan = '# TypeScript Error Fix Plan\n\n';
    
    plan += `## Summary\n`;
    plan += `- **Total Errors:** ${summary.totalErrors}\n`;
    plan += `- **High Priority:** ${summary.highPriorityErrors.length}\n`;
    plan += `- **Easy Fixes:** ${summary.fixableErrors.length}\n`;
    plan += `- **Complex Fixes:** ${summary.complexErrors.length}\n\n`;

    plan += `## Errors by Source\n`;
    const sortedSources = Object.entries(summary.errorsBySource)
      .sort(([, a], [, b]) => b - a);
    for (const [source, count] of sortedSources) {
      plan += `- **${source}:** ${count} errors\n`;
    }

    plan += `\n## Fix Priority Order\n\n`;

    // Phase 1: Missing modules and imports
    const missingModules = this.errors.filter(e => e.category === 'missing_module');
    if (missingModules.length > 0) {
      plan += `### Phase 1: Install Missing Dependencies (${missingModules.length} errors)\n`;
      const modules = new Set(missingModules.map(e => this.extractModuleName(e.message)));
      for (const module of modules) {
        plan += `- Install: \`npm install ${module}\`\n`;
      }
      plan += '\n';
    }

    // Phase 2: Missing properties and methods
    const missingProps = this.errors.filter(e => 
      ['missing_property', 'missing_method', 'missing_identifier'].includes(e.category)
    );
    if (missingProps.length > 0) {
      plan += `### Phase 2: Add Missing Interfaces/Methods (${missingProps.length} errors)\n`;
      const fileGroups = this.groupErrorsByFile(missingProps);
      for (const [file, errors] of Object.entries(fileGroups)) {
        plan += `\n#### ${file}\n`;
        for (const error of errors) {
          plan += `- Line ${error.line}: ${error.message}\n`;
        }
      }
      plan += '\n';
    }

    // Phase 3: Type assignments and conversions
    const typeErrors = this.errors.filter(e => 
      ['type_assignment', 'type_mismatch', 'unsafe_conversion'].includes(e.category)
    );
    if (typeErrors.length > 0) {
      plan += `### Phase 3: Fix Type Issues (${typeErrors.length} errors)\n`;
      const fileGroups = this.groupErrorsByFile(typeErrors);
      for (const [file, errors] of Object.entries(fileGroups)) {
        plan += `\n#### ${file}\n`;
        for (const error of errors) {
          plan += `- Line ${error.line}: ${error.message}\n`;
        }
      }
      plan += '\n';
    }

    // Phase 4: Argument and parameter issues
    const argErrors = this.errors.filter(e => e.category === 'wrong_arguments');
    if (argErrors.length > 0) {
      plan += `### Phase 4: Fix Method Signatures (${argErrors.length} errors)\n`;
      const fileGroups = this.groupErrorsByFile(argErrors);
      for (const [file, errors] of Object.entries(fileGroups)) {
        plan += `\n#### ${file}\n`;
        for (const error of errors) {
          plan += `- Line ${error.line}: ${error.message}\n`;
        }
      }
      plan += '\n';
    }

    // Phase 5: JSX and component errors
    const jsxErrors = this.errors.filter(e => 
      ['jsx_error', 'jsx_component_error'].includes(e.category)
    );
    if (jsxErrors.length > 0) {
      plan += `### Phase 5: Fix JSX/Component Issues (${jsxErrors.length} errors)\n`;
      const fileGroups = this.groupErrorsByFile(jsxErrors);
      for (const [file, errors] of Object.entries(fileGroups)) {
        plan += `\n#### ${file}\n`;
        for (const error of errors) {
          plan += `- Line ${error.line}: ${error.message}\n`;
        }
      }
      plan += '\n';
    }

    return plan;
  }

  private extractModuleName(message: string): string {
    const match = message.match(/Cannot find module '([^']+)'/);
    return match ? match[1] : 'unknown';
  }

  private groupErrorsByFile(errors: TypeScriptError[]): Record<string, TypeScriptError[]> {
    const groups: Record<string, TypeScriptError[]> = {};
    for (const error of errors) {
      if (!groups[error.file]) {
        groups[error.file] = [];
      }
      groups[error.file].push(error);
    }
    return groups;
  }

  saveResults(outputPath: string = '/workspaces/gym-app-plan/typescript-errors.json'): void {
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
    
    console.log(`📄 Results saved to: ${outputPath}`);
    console.log(`📋 Fix plan saved to: ${planPath}`);
  }

  async printQuickSummary(): Promise<void> {
    console.log('\n🔍 TypeScript Error Analysis');
    console.log('============================');
    
    const summary = this.generateSummary();
    
    console.log(`📊 Total Errors: ${summary.totalErrors}`);
    console.log(`🔥 High Priority: ${summary.highPriorityErrors.length}`);
    console.log(`🛠️  Easy Fixes: ${summary.fixableErrors.length}`);
    console.log(`⚠️  Complex: ${summary.complexErrors.length}`);
    
    console.log('\n📁 Top Error Sources:');
    const topSources = Object.entries(summary.errorsBySource)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    for (const [source, count] of topSources) {
      console.log(`   ${source}: ${count} errors`);
    }
    
    console.log('\n🏷️  Error Categories:');
    const topCategories = Object.entries(summary.errorsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    for (const [category, count] of topCategories) {
      console.log(`   ${category}: ${count} errors`);
    }

    if (summary.fixableErrors.length > 0) {
      console.log('\n🚀 Quick Wins (Easy Fixes):');
      for (const error of summary.fixableErrors.slice(0, 5)) {
        console.log(`   ${error.file}:${error.line} - ${error.category}`);
      }
    }
  }
}

// Main execution
async function main() {
  const collector = new TypeScriptErrorCollector();
  
  try {
    await collector.collectErrors();
    await collector.printQuickSummary();
    collector.saveResults();
    
    console.log('\n✅ Error collection complete!');
    console.log('📋 Check typescript-errors-plan.md for detailed fix instructions');
    
  } catch (error) {
    console.error('❌ Error collection failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { TypeScriptErrorCollector, TypeScriptError, ErrorSummary };
