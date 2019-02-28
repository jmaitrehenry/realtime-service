const app = require('express')();
const http = require('http').Server(app);
const socketIO = require('socket.io');
const redis = require('socket.io-redis');
const config = require('config');

const utils = require('./lib/utils');
const metrics = require('./lib/metric.js')();
const libSocket = require('./lib/socket')(metrics);
const routes = require('./routes');

const io = new socketIO(http, {
  path: '/client',
  adapter: redis({ host: config.get('redis'), port: 6379 }),
  cookie: false
})

const appRouter = routes(io, metrics);
const metricRouter = metrics.router;

app.use(metricRouter);
app.use(appRouter);

console.log(libSocket.onConnection)

io.on('connection', libSocket.onConnection);

http.listen(3000, function(){
  console.log('listening on *:3000');
});
