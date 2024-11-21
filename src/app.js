const express = require('express');
const config = require('./config');
const middlewares = require('./middlewares');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(middlewares.corsOptions);
app.use('/api', require('./routes/index'));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to DesHeures API Application' });
});

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

mongoose
  .connect(
    `mongodb+srv://${config.mongo_user}:${config.mongo_pwd}@${config.mongo_cluster}.mongodb.net/`
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));
