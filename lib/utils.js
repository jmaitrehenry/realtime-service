const auth = require('basic-auth');
const config = require('config');

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