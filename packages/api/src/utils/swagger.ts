import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resume Builder 9000 API',
      version: '1.0.0',
      description: 'API documentation for Resume Builder 9000',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'Resume Builder 9000 Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local Development Server',
      },
    ],
  },
  apis: ['./dist/controllers/*.js', './dist/index.js'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
