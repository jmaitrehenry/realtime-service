# realtime-push-server
A realtime push server using socket.io and exposing a HTTP API for "pushing" information to client.

## Usage
### Starting the service
```bash
$ npm install
$ npm start
```

#### With docker-compose
```bash
$ docker-compose up -d
```

### Sending push notification to users
```
POST /api/push/:channel/:event 
Header:
  - Authorization: Basic <app_key>:<app_secret>
Body: {<object to send to client>}
```

### Connect client to server
```js
import * as io from 'socket.io-client';

function createSocket() {
    const user = {
      id: 123,
      jwtToken: 'token123',
      //<key>: <value>,
    };

    const socket = io('http://<my_server>/', {
      path: '/client',
      query: {
        user: JSON.stringify(user)
      }
    });

    socket.on('disconnect', () => {
      console.log('WebsocketService - Disconnected');
    });

    return socket;
  }
```

### Subscribe to channel
```js
const socket = createSocket();
socket.emit('subscribe', channel);
```

## Configuration
With environnment variable:
- `APPLICATIONS`: Application key:secret list. If the list is an empty string or an empty array, the authentification is disabled. 
- `AUTHENTIFICATION_URL`: URL the service will call to verify if the user is authentificated or not.
- `AUTHORIZATION_URL`: URL the service will send a POST request with the user object and the channel (`{user: user, channel: channel}`) for checking if the user can subscribe to the channel or not
- `UNSUBSCRIBE_URL`: If a user leave a channel, send the information to your service
- `REDIS_HOST`: Redis host, by default `127.0.0.1`

For now, the application only support an url where it will forward the JWT Token given by the client.
This URL should return a 200 in case of success, all other return code is a failure.

