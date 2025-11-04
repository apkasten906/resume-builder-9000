import { z } from 'zod';
import { createDocument, createSchema } from 'zod-openapi';
import { ResumeDataSchema, JobDetailsSchema } from '@rb9k/core';
import {
  ParsedEducationSchema,
  ParsedExperienceSchema,
  ParsedPersonalInfoSchema,
  ParsedResumeFieldsSchema,
  ParsedResumeHistoryEntrySchema,
  ParsedResumeUpsertSchema,
} from '../types/parsedResume.js';

const StoredResumeSchema = z.object({
  id: z.string(),
  content: z.string(),
  resumeData: ResumeDataSchema,
  jobDetails: JobDetailsSchema,
  createdAt: z.string(),
});

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  emailConfirmed: z.boolean(),
});

const ApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const schemas = {
  ResumeData: createSchema(ResumeDataSchema).schema,
  JobDetails: createSchema(JobDetailsSchema).schema,
  StoredResume: createSchema(StoredResumeSchema).schema,
  User: createSchema(UserSchema).schema,
  Application: createSchema(ApplicationSchema).schema,
  ParsedPersonalInfo: createSchema(ParsedPersonalInfoSchema).schema,
  ParsedExperience: createSchema(ParsedExperienceSchema).schema,
  ParsedEducation: createSchema(ParsedEducationSchema).schema,
  ParsedResumeFields: createSchema(ParsedResumeFieldsSchema).schema,
  ParsedResumeUpdate: createSchema(ParsedResumeUpsertSchema).schema,
  ParsedResumeHistoryEntry: createSchema(ParsedResumeHistoryEntrySchema).schema,
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
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
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
        summary: 'Upload, parse, and persist a resume file',
        description:
          'Upload a resume file (PDF, DOCX, TXT, MD), extract data, persist to database, and return the stored resume with ID and timestamp. File validation checks both extension and magic bytes/MIME type for PDF and DOCX files. If PDF parsing fails, fallback text is used and the resume is still persisted.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Resume file (PDF, DOCX, TXT, or MD) - max 5MB',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Resume successfully parsed and persisted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'Unique identifier for the stored resume (UUID)',
                      example: '038a5af3-7632-4f4e-bcf7-f49e95da4797',
                    },
                    summary: {
                      type: 'string',
                      description: 'Extracted summary text',
                    },
                    experience: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Extracted experience entries',
                    },
                    skills: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Extracted skills',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Timestamp when resume was uploaded',
                      example: '2025-10-23T10:00:24.323Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request (e.g., missing file, unsupported file type)',
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
          413: {
            description: 'File too large (max 5MB)',
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
            description: 'Failed to process resume',
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
      get: {
        summary: 'List all resumes',
        description:
          'Retrieve all uploaded resumes, sorted by creation date descending (most recent first)',
        responses: {
          200: {
            description: 'List of all stored resumes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/StoredResume' },
                },
              },
            },
          },
          500: {
            description: 'Failed to retrieve resumes',
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
                schema: { $ref: '#/components/schemas/StoredResume' },
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
    '/api/resumes/{id}/parsed-fields': {
      get: {
        summary: 'Get parsed resume fields for an upload',
        description:
          'Retrieve parsed resume fields for the authenticated user. Creates defaults when no parsed data exists yet.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resume upload identifier',
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Parsed resume fields for the requested upload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    parsedFields: { $ref: '#/components/schemas/ParsedResumeFields' },
                    history: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ParsedResumeHistoryEntry' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing upload identifier',
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
          401: { description: 'Unauthorized' },
          404: {
            description: 'Parsed fields not found for the provided upload',
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
      put: {
        summary: 'Update parsed resume fields for an upload',
        description: 'Persist parsed resume updates for the authenticated user.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resume upload identifier',
          },
        ],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParsedResumeUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Parsed resume fields saved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    parsedFields: { $ref: '#/components/schemas/ParsedResumeFields' },
                    history: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ParsedResumeHistoryEntry' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: {
                      type: 'object',
                      properties: {
                        fieldErrors: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/resumes/{id}/parsed-fields/history': {
      get: {
        summary: 'Get parsed resume change history',
        description: 'Retrieve the historical snapshots of parsed resume fields for the authenticated user.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resume upload identifier',
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Parsed resume history entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    history: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ParsedResumeHistoryEntry' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing upload identifier',
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
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/resumes/{id}/parsed-fields/history/{historyId}/restore': {
      post: {
        summary: 'Restore parsed resume fields from history',
        description: 'Restore parsed resume data using a previously recorded history snapshot.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Resume upload identifier',
          },
          {
            name: 'historyId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'History snapshot identifier',
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Parsed resume restored successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    parsedFields: { $ref: '#/components/schemas/ParsedResumeFields' },
                    history: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ParsedResumeHistoryEntry' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing identifiers',
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
          401: { description: 'Unauthorized' },
          404: { description: 'History entry not found' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Create a new user account with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'confirmPassword'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 8, example: 'ValidPass1!' },
                  confirmPassword: { type: 'string', example: 'ValidPass1!' },
                  fullName: { type: 'string', minLength: 2, maxLength: 120, example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                    requiresEmailConfirmation: { type: 'boolean', example: true },
                    verification: {
                      type: 'object',
                      properties: {
                        sentTo: { type: 'string', example: 'user@example.com' },
                        expiresAt: { type: 'string', example: '2025-10-17T12:30:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input or password does not meet requirements' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        description: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'ValidPass1!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT token (dev only)' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials' },
          403: { description: 'Email not confirmed' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout user',
        description: 'Invalidate user session',
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user',
        description: 'Get the authenticated user profile',
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/verify-email': {
      post: {
        summary: 'Verify email address',
        description: 'Verify user email with token from verification email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', example: 'verification-token-here' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email verified successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT token (dev only)' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid token' },
          410: { description: 'Token expired' },
        },
      },
    },
    '/auth/resend-verification': {
      post: {
        summary: 'Resend verification email',
        description: 'Send a new verification email to unverified user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Verification email sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    sentTo: { type: 'string', example: 'user@example.com' },
                    expiresAt: { type: 'string', example: '2025-10-17T12:30:00.000Z' },
                  },
                },
              },
            },
          },
          400: { description: 'Email already confirmed' },
          404: { description: 'User not found' },
        },
      },
    },
    '/applications': {
      get: {
        summary: 'List job applications',
        description: 'Get all applications for authenticated user',
        responses: {
          200: {
            description: 'List of applications',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Application' },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create job application',
        description: 'Create a new job application',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company', 'role'],
                properties: {
                  company: { type: 'string', example: 'Tech Corp' },
                  role: { type: 'string', example: 'Senior Developer' },
                  location: { type: 'string', example: 'Remote' },
                  status: { type: 'string', example: 'applied' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Application created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Application' },
              },
            },
          },
          400: { description: 'Invalid input' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/applications/{id}': {
      get: {
        summary: 'Get application by ID',
        description: 'Retrieve a specific application',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Application ID',
          },
        ],
        responses: {
          200: {
            description: 'Application details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Application' },
              },
            },
          },
          404: { description: 'Application not found' },
          401: { description: 'Unauthorized' },
        },
      },
      put: {
        summary: 'Update application',
        description: 'Update an existing application',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Application ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  company: { type: 'string' },
                  role: { type: 'string' },
                  location: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Application updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Application' },
              },
            },
          },
          404: { description: 'Application not found' },
          401: { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Delete application',
        description: 'Delete an existing application',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Application ID',
          },
        ],
        responses: {
          200: {
            description: 'Application deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          404: { description: 'Application not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/jobDescription/parse': {
      post: {
        summary: 'Parse job description',
        description: 'Extract structured data from job description text',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: { type: 'string', example: 'We are looking for a Senior Developer...' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Parsed job description',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    requirements: { type: 'array', items: { type: 'string' } },
                    keywords: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/tailor': {
      post: {
        summary: 'Tailor resume bullets',
        description: 'Score and rank resume bullets against job keywords',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bullets', 'keywords'],
                properties: {
                  bullets: { type: 'array', items: { type: 'string' } },
                  keywords: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Scored bullets',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      text: { type: 'string' },
                      score: { type: 'number' },
                      keywords: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/resume/download': {
      post: {
        summary: 'Download resume',
        description: 'Generate and download resume in markdown format',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: '# Resume\n\n- Experience bullet' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Resume file',
            content: {
              'text/markdown': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          400: { description: 'Invalid input' },
        },
      },
    },
  },
});
