const app = require('express')();
const http = require('http').Server(app);
const socketIO = require('socket.io');
const redis = require('socket.io-redis');
const bodyParser = require('body-parser');

const config = require('config');
const utils = require('./lib/utils');
const routes = require('./routes');

const io = new socketIO(http, {
  path: '/client',
  adapter: redis({ host: config.get('redis'), port: 6379 }),
  cookie: false
})

const jsonParser = bodyParser.json();

app.use('/api', jsonParser, routes.api(io));

io.on('connection', utils.socketOnConnection);

http.listen(5000, function(){
  console.log('listening on *:5000');
});
