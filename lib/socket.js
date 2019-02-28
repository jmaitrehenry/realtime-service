"use strict";

const config = require('config');
const rp = require('request-promise');

module.exports = (metric) => {
  return {
    onConnection: async (socket) => {
      if(!socket.handshake.query.user) {
        console.error('Missing authentification information');
        socket.disconnect(true);
        return;
      }
      const user = JSON.parse(socket.handshake.query.user);
      console.log(user)
      const isAuth = await authentificateUser(user);
    
      if(!isAuth) {
        console.error('401 Unauthorized');
        socket.disconnect(true);
        return;
      }

      metric.incOnlineUser();
      console.log('User connected: ' + user.id);
      socket.on('disconnect', () => {
        metric.decOnlineUser();
        console.log('user disconnected');
      });
    
      socket.on('subscribe', (channel, cb) => {
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
  }
}

async function authentificateUser(user) {
  const authUrl = config.get('authentification_url');
  console.log(authUrl)

  return await rp.get(authUrl, {
    resolveWithFullResponse: true,
    auth: {
      bearer: user.jwtToken
    }
  }).then((response) => {
    console.log(response.statusCode)
    if(response.statusCode == 200) {
      return true;
    }
    return false;
  }).catch((err) => {
    console.log(err)

    return false;
  });
}