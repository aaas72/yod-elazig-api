import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJsdoc.SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'YOD Elazig API',
    version: '1.0.0',
    description: 'RESTful API for YOD Elazig Youth Organization platform.',
    contact: {
      name: 'YOD Elazig Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ BearerAuth: [] }],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
