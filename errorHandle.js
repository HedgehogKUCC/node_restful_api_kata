const config = require('./config');

function errorHandle(res, msg) {
  res.writeHead(400, config.headers);
  res.write(JSON.stringify({
    'result': 'error',
    'message': msg,
  }));
  res.end();
}

module.exports = errorHandle;
