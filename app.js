const 
  express = require('express'),
  http = require('http'),
  favicon = require('serve-favicon'),
  path = require('path'),
  socket = require('socket.io'),
  room = require('./scripts/room'),
  var_dump = require('var_dump');

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
    const thisRoom = room.joinRoom(data.roomId, socket);
    socket.emit('roomJoined', thisRoom);
    
    if (thisRoom != null) {
      socket.to(thisRoom.roomId).emit('playerJoined', thisRoom.players[thisRoom.players.length - 1]);
    }
    console.log('joinRoom');
  });

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected!');
    const thisRoom = room.removePlayer(socket.id);

    if (thisRoom != null) {
      socket.to(thisRoom.roomId).emit('playerDisconnected', socket.id);
    }
    console.log('disconnect');
  });

  socket.on('customName', function (name) {
    const thisRoom = room.setCustomName(socket.id, name);
    socket.to(thisRoom.roomId).emit('nameChanged', { playerId: socket.id, name: name});
  });

  socket.on('toggleReady', function() {
    const roomAndIsReady = room.togglePlayerReadyStatus(socket.id);
    
    if (roomAndIsReady != null) {
      io.in(roomAndIsReady.room.roomId).emit('playerReadyStatusChanged', { playerId: socket.id, isReady: roomAndIsReady.isReady });
    } 
  });
});