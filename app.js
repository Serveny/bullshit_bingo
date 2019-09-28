'use strict';

// bullshitbingo namespace
global.wb = {
  io: null,
  roomMap: null,
  wordMap: null
};

const express = require('express'),
  http = require('http'),
  favicon = require('serve-favicon'),
  path = require('path'),
  socket = require('socket.io'),
  debug = require('debug')('wb'),
  webpack = require('webpack'),
  webpackCfg = require('./webpack.config'),
  // bb scripts
  bb_Socket_In = require('./scripts/bb-socket-in'),
  app = express();

  console.log(webpackCfg);
  const compiler = webpack(webpackCfg);

  compiler.run((err, stats) => {
    if(err == null) {
      console.log('Webpack: Build successfull.');
    } else {
      console.log('Webpack: Build failed.', err);
    }
    
  });

app.set('port', /*process.env.PORT || */ 1510);

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const server = http.createServer(app).listen(app.get('port'), () => {
  console.log('Let\'s go! Port: ' + app.get('port'));
});

global.wb.io = socket(server);
global.wb.io.on('connection', socket => {
  debug(` --- ${socket.id} connected --- `);
  bb_Socket_In.addEvents(socket);
});
