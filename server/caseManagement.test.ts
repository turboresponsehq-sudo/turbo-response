import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../server/routers';
import type { Context } from '../server/_core/context';

// Mock context for testing
const mockContext: Context = {
  req: {} as any,
  res: {} as any,
  user: {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: 'test',
  },
};

describe('Case Management tRPC Procedures', () => {
  let testCaseId: number;

  it('should create a new case', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const result = await caller.case.create({
      title: 'Test IRS Case',
      category: 'IRS',
      description: 'Test case for IRS dispute',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '555-1234',
    });

    expect(result.success).toBe(true);
    expect(result.caseId).toBeDefined();
    expect(typeof result.caseId).toBe('number');
    
    testCaseId = result.caseId;
  });

  it('should get case by ID', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const caseData = await caller.case.getById({ id: testCaseId });
    
    expect(caseData).toBeDefined();
    expect(caseData.id).toBe(testCaseId);
    expect(caseData.title).toBe('Test IRS Case');
    expect(caseData.category).toBe('IRS');
    expect(caseData.clientName).toBe('John Doe');
  });

  it('should list all cases', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const cases = await caller.case.list();
    
    expect(Array.isArray(cases)).toBe(true);
    expect(cases.length).toBeGreaterThan(0);
    
    const testCase = cases.find(c => c.id === testCaseId);
    expect(testCase).toBeDefined();
  });

  it('should upload a document to a case', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    // Create a small test file (base64 encoded)
    const testFileContent = 'This is a test document';
    const base64Content = Buffer.from(testFileContent).toString('base64');
    
    const result = await caller.case.uploadDocument({
      caseId: testCaseId,
      fileName: 'test-document.txt',
      fileData: base64Content,
      mimeType: 'text/plain',
      note: 'Test document upload',
    });

    expect(result.success).toBe(true);
    expect(result.fileUrl).toBeDefined();
    expect(typeof result.fileUrl).toBe('string');
  });

  it('should get documents for a case', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    const documents = await caller.case.getDocuments({ caseId: testCaseId });
    
    expect(Array.isArray(documents)).toBe(true);
    expect(documents.length).toBeGreaterThan(0);
    
    const testDoc = documents[0];
    expect(testDoc.caseId).toBe(testCaseId);
    expect(testDoc.fileName).toBe('test-document.txt');
    expect(testDoc.note).toBe('Test document upload');
  });

  it('should delete a document', async () => {
    const caller = appRouter.createCaller(mockContext);
    
    // Get documents first
    const documents = await caller.case.getDocuments({ caseId: testCaseId });
    expect(documents.length).toBeGreaterThan(0);
    
    const docToDelete = documents[0];
    
    // Delete the document
    const result = await caller.case.deleteDocument({ id: docToDelete.id });
    expect(result.success).toBe(true);
    
    // Verify it's deleted
    const remainingDocs = await caller.case.getDocuments({ caseId: testCaseId });
    expect(remainingDocs.length).toBe(documents.length - 1);
  });
});
