const 
  express = require('express'),
  http = require('http'),
  favicon = require('serve-favicon'),
  path = require('path');

app = express();
app.set('port', /*process.env.PORT || */4182);

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

http.createServer(app).listen(app.get('port'), () => {
  console.log('Meddl Loide! Port: ' + app.get('port'));
});