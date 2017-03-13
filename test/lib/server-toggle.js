'use strict';

const debug = require('debug')('decor8:server-toggle');

module.exports = exports = {};

exports.serverOn = function(server, done){
  if(!server.isRunning){
    console.log('server', server);
    server.listen(process.env.PORT, () => {
      server.isRunning = true;
      debug('Server up!');
      done();
    });
    return;
  }
  done();
};

exports.serverOff = function(server, done){
  if(server.isRunning) {
    server.close( err => { //eslint-disable-line
      server.isRunning = false;
      debug('server down!');
      done();
    });
    return;
  }
  done();
};
