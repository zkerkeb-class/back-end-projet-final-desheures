const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DesHeures API',
    version: '1.0.0',
    description: 'API pour l’application DesHeures'
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: 'Serveur local'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['src/routes/*.js', 'src/models/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
