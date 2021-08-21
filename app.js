'use strict';
const dbCfg = require('config').db;

// bullshitbingo namespace
global.wb = {
  io: null,
  roomMap: null,
  wordMap: null,
};

const appCfg = require('config').app,
  express = require('express'),
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

  const compiler = webpack(webpackCfg);

  compiler.run((err) => {
    if(err == null) {
      console.log('Webpack: Build successfull.');
    } else {
      console.log('Webpack: Build failed.', err);
    }
    
  });

app.set('port', /*process.env.PORT || */ appCfg.port);

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
