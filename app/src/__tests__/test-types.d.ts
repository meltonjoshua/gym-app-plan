declare namespace jest {
  interface Matchers<R> {
    toBeTruthy(): R;
    toBeLessThan(expected: number): R;
    toBe(expected: any): R;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      performance: Performance;
    }
  }
}

// Extend Performance interface for memory usage
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  clearMeasures?(): void;
}

export {};
