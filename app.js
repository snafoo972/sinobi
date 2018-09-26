var ffmpeg = require('fluent-ffmpeg');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ss = require('socket.io-stream');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  var outStream = ss.createStream();
  ss(socket).emit('newstream', outStream);

  // .duration(10)

  // stream.on("data", function(){
  //   console.log("stream getting data");
  // });

  ffmpeg("rtsp://admin:avecnous2@192.168.7.54:554/OVProfile01")
    .format("mpegts")
    .videoCodec('mpeg1video')
    .audioCodec('mp2')
    .fps(24)
    .on('error', function(err, stdout, stderr) {
        console.log('Cannot process video: ' + err.message);
    })
    .on('end', function() {
      console.log('Processing finished !');
    })
    .stream(outStream);

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
