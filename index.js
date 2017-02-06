var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');

var spawn = require('child_process').spawn;
var proc;

app.use('/', express.static(path.join(__dirname, 'stream')));
	
app.get('/', function(req, res){

	res.sendFile(__dirname + '/index.html');
});

var sockets = {};

io.on('connection', function(socket){

	sockets[socket.id] = socket;
	console.log("Total clients Connected : ",  Object.keys(sockets).length);

	socket.on('disconnect', function(){
		console.log('were disconnected')
		delete sockets[socket.id];

		//no more sockets, kill the stream
		if (Object.keys(sockets).length == 0) {

			//app.set('watchingFile', false);
			if (proc) proc.kill();
			fs.unwatchFile('./stream/image_stream.jpg');
		}
	});

	socket.on('stop-stream', function(){
				proc.kill();
	//		stopStreaming();
	});

	socket.on('start-stream', function(){
		startStreaming(io);
	});

});

http.listen(3000, function(){

	console.log('listening on *.3000');
});
	
function stopStreaming(){

	if (Object.keys(sockets).length == 0){
		app.set('watchingFile', false);
		if (proc) proc.kill();
		fs.unwatchFile('./stream/image_stream.jpg');
	}
	
}

function startStreaming(){
	console.log(app.get('watchingFile'));

		if (app.get('watchingFile')) {
			io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
		return;
		}




//var args = ["-w", "200", "-h", "200", "-o", "./stream/image_stream.jpg", "-t", "9999999", "-tl", "80"];
var args = ["-w", "200", "-h", "200", "-o", "/home/pi/node_progams/liveStreaming/stream/image_stream.jpg", "-t", "9999999", "-tl", "80"];

proc = spawn("raspistill", args);


console.log("Watching for changes...");

app.set('watchingFile', true);

//fs.watch('./stream/image_stream.jpg', function(current, previous) {
//	io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
//});

var images = setInterval(function(){

	io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 10000));
	//	io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + 2);
	//io.sockets.emit('liveStream', '/home/pi/node_progams/liveStreaming/stream/image_stream.jpg');

}, 80);

}
