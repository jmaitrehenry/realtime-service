const auth = require('basic-auth');
const config = require('config');
const rp = require('request-promise');
let connectedUser = 0;

exports.auth = function(req, res, next) {
  const apps = config.get('applications');
  
  // If we don't have any apps con figured, we just skip the authentification
  if(apps || apps.length == 0) {
    next();
    return;
  }

  const app = auth(req);
  if(apps.split(',').indexOf(app.name + ':' + app.pass) == -1) {
    return res.status(401).send('401 Unauthorized');
  }

  next();
}

setInterval(() => {
  console.log('Connected users: ' + connectedUser);
}, 1000);

exports.socketOnConnection = async function(socket) {
  connectedUser++;

  if(!socket.handshake.query.user) {
    console.error('Missing authentification information');
    socket.disconnect(true);
    return;
  }
  const user = JSON.parse(socket.handshake.query.user);
  const isAuth = await authentificateUser(user);

  if(!isAuth) {
    console.error('401 Unauthorized');
    socket.disconnect(true);
    return;
  }

  console.log('User connected: ' + user.id);
  socket.on('disconnect', function(){
    connectedUser--;
    console.log('user disconnected');
  });

  socket.on('subscribe', function(channel, cb) {
    console.log('subscribe to channel: ' + channel + ' for user ' + user.id)
    const url = config.get('authorization_url');
    rp
      .post({
        uri: url,
        resolveWithFullResponse: true,
        auth: {
          bearer: user.jwtToken
        },
        body: {
          user: user,
          channel: channel
        },
        json: true
      })
      .then((response) => {
        const data = response.body.data || null;
        const status = response.body.status || 'unauthorized';
        const error = response.body.error || false;

        if(status === 'authorized') {
          socket.join(channel);
          if(cb) {
            cb({success: true, data: data});
          }
          return;
        }

        if(cb) {
          cb({success: false, error: error, data: data, status: status});
        }

      })
      .catch((err) => {
        if(cb) {
          cb({success: false, status: 'unauthorized', error: '401 Unauthorized'});
        }
      })
  });

  socket.on('unsubscribe', (channel) => {
    socket.leave(channel);

    if(config.get('unsubscribe_url')) {
      rp.post({
        url: config.get('unsubscribe_url'),
        body: {
          channel: channel
        }
      })
    }
  })
}

async function authentificateUser(user) {
  const authUrl = config.get('authentification_url');

  return await rp.get(authUrl, {
    resolveWithFullResponse: true,
    auth: {
      bearer: user.jwtToken
    }
  }).then((response) => {
    if(response.statusCode == 200) {
      return true;
    }
    return false;
  }).catch((err) => {
    return false;
  });
}