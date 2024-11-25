const express = require('express');
const middlewares = require('./middlewares');
const config = require('./config');
const app = express();
const swaggerUi = require('swagger-ui-express');

app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(middlewares.corsOptions);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to DesHeures API Application' });
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use('/api', require('./routes/index'));

config.connectToDatabase();

app.listen(config.env.port, () => {
  console.log(`Server is running on http://localhost:${config.env.port}`);
  console.log(
    `Swagger Docs available at http://localhost:${config.env.port}/api-docs`
  );
});
