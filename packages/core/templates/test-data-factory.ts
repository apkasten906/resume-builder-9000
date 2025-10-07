// test-data-factory.ts
/**
 * Factory for generating test data objects for integration/e2e tests
 * Centralizes test data creation for maintainability and reuse
 */
export const testDataFactory = {
  createWorkflowInput(): any {
    return {
      // Populate with realistic workflow input fields
      userId: 'test-user-1',
      payload: { key: 'value' },
    };
  },
  createExpectedOutcome(): any {
    return {
      // Populate with expected workflow result fields
      status: 'success',
      result: { key: 'value' },
    };
  },
  createConcurrentInputs(): any[] {
    return [
      { userId: 'test-user-1', payload: { key: 'value1' } },
      { userId: 'test-user-2', payload: { key: 'value2' } },
    ];
  },
  createPersistentData(): any {
    return {
      id: 'persist-1',
      data: { key: 'persisted' },
    };
  },
  createServiceRequest(): any {
    return {
      endpoint: '/external',
      params: { foo: 'bar' },
    };
  },
  createPerformanceInput(): any {
    return {
      operation: 'heavy',
      params: { size: 1000 },
    };
  },
};
