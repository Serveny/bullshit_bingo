const 
  express = require('express'),
  http = require('http'),
  favicon = require('serve-favicon'),
  path = require('path'),
  socket = require('socket.io'),
  uniqid = require('uniqid');

app = express();
app.set('port', /*process.env.PORT || */1510);

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const server = http.createServer(app).listen(app.get('port'), () => {
  console.log('Meddl Loide! Port: ' + app.get('port'));
});

const io = socket(server);

io.on('connection', function (socket) {
  socket.on('joinRoom', function (data) {
    console.log('joinRoom', data);
    const roomId = uniqid();
    socket.join(roomId);
    socket.emit('roomJoined', { roomId: roomId });
  });
});