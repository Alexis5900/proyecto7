const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Pizzería',
      version: '1.0.0',
      description: 'Documentación de la API de la pizzería (MOD7)',
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:3005',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 