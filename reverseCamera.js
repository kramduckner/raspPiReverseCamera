var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');

var spawn = require('child_process').spawn;
var camOptions = ["-w", "200", "-h", "200", "-o", "/home/pi/node_progams/liveStreaming/stream/image_stream.jpg", "-t", "9999999", "-tl", "80"];
var proc;
var streamInterval;

app.use('/', express.static(path.join(__dirname, 'stream')));

app.get('/', function(req, res){

        res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    
    socket.on('disconnect', function(){

	killStream();
    });

    socket.on('stop-stream', function(){

	killStream();
    });

    socket.on('start-stream', function(){

        startStream(io);
    });
});

http.listen(3000, function(){
    
    console.log('listening on *.3000');
});

function killStream(){

    clearInterval(streamInterval);
    proc.kill();
}

function startStream(){

    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    proc = spawn("raspistill", camOptions);
    
    var streamInterval = setInterval(function(){

        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 10000));

    }, 80);
}
