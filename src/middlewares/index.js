const corsOptions = require('./cors');
const bodyParser = require('./bodyParser');
const helmet = require('./helmet');
const rateLimiter = require('./rateLimiter');
const isAuth = require('./isAuth');
module.exports = {
  corsOptions,
  bodyParser,
  helmet,
  rateLimiter,
  isAuth
};
