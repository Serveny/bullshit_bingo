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
    
    console.log('joinRoom - List: ');
    var_dump(global.roomList);
  });
  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected!');
    room.removePlayer(socket.id);
    console.log('disconnect - List: ');
    var_dump(global.roomList);
 });
});