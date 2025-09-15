import { createDocument, createSchema } from 'zod-openapi';
import { ResumeDataSchema, JobDetailsSchema } from '@rb9k/core';

const schemas = {
  ResumeData: createSchema(ResumeDataSchema).schema,
  JobDetails: createSchema(JobDetailsSchema).schema,
};

export const openApiSpec = createDocument({
  openapi: '3.0.0',
  info: {
    title: 'Resume Builder 9000 API',
    version: '1.0.0',
    description: 'API documentation for Resume Builder 9000',
    contact: { name: 'Resume Builder 9000 Team' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local Development Server' }],
  components: {
    schemas,
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Check the health of the API',
        description: 'Returns the status of the API and current timestamp',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', example: '2025-09-13T00:00:00.000Z' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/resumes': {
      post: {
        summary: 'Create a new resume',
        description: 'Generate a new resume based on user data and job details',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  resumeData: { $ref: '#/components/schemas/ResumeData' },
                  jobDetails: { $ref: '#/components/schemas/JobDetails' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Resume created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    resumeData: { $ref: '#/components/schemas/ResumeData' },
                    jobDetails: { $ref: '#/components/schemas/JobDetails' },
                    createdAt: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to create resume',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/resumes/{id}': {
      get: {
        summary: 'Get a resume by ID',
        description: 'Retrieve a specific resume by its unique identifier',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Unique identifier for the resume',
          },
        ],
        responses: {
          200: {
            description: 'Resume found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Resume not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
