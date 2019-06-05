'use strict';
const 
    express = require('express'),
    http = require('http'),
    favicon = require('serve-favicon'),
    path = require('path'),
    socket = require('socket.io'),

    // wB scripts
    wB_Socket = require('./scripts/wB_Socket'),

    app = express();

app.set('port', /*process.env.PORT || */1510);

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log('Meddl Loide! Port: ' + app.get('port'));
});

const io = socket(server);

io.on('connection', function (socket) {
    wB_Socket.addEvents(socket, io); 
});