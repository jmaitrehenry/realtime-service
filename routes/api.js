const express = require('express');

const utils = require('../lib/utils');
  
module.exports = (io, metric) => {
  const router = express.Router();

  router.use('/', utils.auth);
  
  router.post('/push/:channel/:event', (req, res) => {
    io.sockets.in(req.params.channel).emit(req.params.event, req.body);
    res.send('Fire and forget!');

    metric.incMessageSent();
  });

  return router;
}