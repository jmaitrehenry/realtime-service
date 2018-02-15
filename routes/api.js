const express = require('express');
const utils = require('../lib/utils');
  
exports.default = function(io) {
  const routeur = express.Router();

  routeur.use('/', utils.auth);
  
  routeur.post('/push/:channel/:event', function(req, res) {
    io.sockets.in(req.params.channel).emit(req.params.event, req.body)
    res.send('Fire and forget!')
  });

  return routeur;
}