const express = require('express');
const config = require('./config/env');
const middlewares = require('./middlewares');
const connectToDatabase = require('./config/db');
const app = express();

app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(middlewares.corsOptions);
app.use('/api', require('./routes/index'));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to DesHeures API Application' });
});

connectToDatabase();

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
