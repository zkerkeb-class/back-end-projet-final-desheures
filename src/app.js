const express = require('express');
const config = require('./config');
const middlewares = require('./middlewares');

const app = express();

app.use(express.json);

app.use('/api', require('./routes/index'));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to DesHeures API Application' });
});

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
