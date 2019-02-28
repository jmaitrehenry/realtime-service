"use strict";

const client = require('prom-client');
const config = require('config');
const express = require('express');

module.exports = () => {
  const prom = new Prometheus();
  return prom;
}

class Prometheus {
  constructor() {
    this.initializeMetrics();
    this.initializeRouter();
  }

  incMessageSent() {
    this.messageSentCounter.inc();
  }

  incOnlineUser() {
    this.onlineUserGauge.inc();
  }

  decOnlineUser() {
    this.onlineUserGauge.dec();
  }

  initializeMetrics() {
    this.onlineUserGauge = new client.Gauge({
      name: 'connected_users',
      help: 'Number of connected user'
    });
    
    this.messageSentCounter = new client.Counter({
      name: 'message_sent',
      help: 'Number of message sent'
    })
  }

  initializeRouter() {
    this.router = express.Router();

    this.router.get('/metrics', (req, res) => {
      res.set('Content-Type', client.register.contentType);
      res.end(client.register.metrics());
    });
  }
}