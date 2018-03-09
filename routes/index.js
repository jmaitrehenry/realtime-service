const bodyParser = require('body-parser');
const express = require('express');

const api = require('./api');

module.exports = (io, metric) => {
  const jsonParser = bodyParser.json();
  const router = express.Router();

  router.use('/api', jsonParser, api(io, metric));

  return router;
}