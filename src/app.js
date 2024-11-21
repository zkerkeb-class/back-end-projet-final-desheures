const express = require('express');
const config = require('./config/env');
const middlewares = require('./middlewares');
const connectToDatabase = require('./config/db');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); // Importe le fichier de config Swagger

app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(middlewares.corsOptions);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to DesHeures API Application' });
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', require('./routes/index'));

connectToDatabase();

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log(
    `Swagger Docs available at http://localhost:${config.port}/api-docs`
  );
});
