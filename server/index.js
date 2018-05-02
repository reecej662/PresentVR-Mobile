const app = require('express')();
const bodyParser = require('body-parser');
const multer = require('multer');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const util = require('util');
const fs = require('fs');
const db = require('./db');
const cors = require('cors');

var clients = [];
var slides = {};

const connection = db.openConnection;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var upload = multer({ dest: 'uploads/' });

io.on('connection', function(socket){
	clients.push(socket.id);
	var clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
	
	console.log(clientConnectedMsg);

	db.insert(socket.id, codeForSession(socket.id), function (result) {
		if(result) {
			console.log("Added " + socket.id + " to database ");

			if(io.sockets.connected[socket.id]) {
				console.log("sending room code " + codeForSession(socket.id));
				io.sockets.connected[socket.id].emit('room code', codeForSession(socket.id));
			}
		}
	});
	
	socket.on('disconnect', function() {
		clients.pop(socket.id);
		var clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
 		db.remove(socket.id, function (result) {
			console.log(clientDisconnectedMsg);
		});
	})
});

function sendEmotion(emotion) {
	console.log('Emotion sent to user');
	io.emit('new message', emotion)
}

function sendEmotionToSession(emotion, session) {
	console.log('Emotion ' + emotion + ' sent to session ' + session);
	if(io.sockets.connected[session])
		io.sockets.connected[session].emit('new message', emotion);
}

app.get('/', function (req, res) {
	res.send("PresentVR")
})

app.get('/r/:roomId', function(req, res) {
	db.sessionForCode(req.params.roomId, function(result) {
		if(result.length)
			res.send({"sessionId": result});
		else
			res.send({"error": "room not found"});
	});
});

app.post('/r/:sessionId', function(req, res) {
	// Send if the response was successful or not
	res.send("Got emotion " + req.query.emotion + " in session "  + req.params.sessionId);
	sendEmotionToSession(req.query.emotion, req.params.sessionId);
	//sendEmotion(req.query.emotion);
});

app.post('/r/:sessionId/transcript', upload.single('file'), function(req, res) {
	res.send("Got transcript for session " + req.params.sessionId);

	fs.readFile(req.file.path, 'utf8', function (err, data) {
		if(err) {
			return console.log(err);
		}
	
		db.addTranscript(req.params.sessionId, data, function(response) {
			console.log(response);
		})
	})
})

app.get('/r/:sessionId/transcript', function(req, res) {
	db.getTranscript(req.params.sessionId, function (result) {
		const size = req.query.size ? parseInt(req.query.size) : 5;
 		const index = req.query.index ? parseInt(req.query.index) * size : 0;
		var splitString = result.replace(/\\n/g, ' ').split(" ");

		var string = "";

		for(var i = index; i < (index + size) && i < splitString.length; i++) {
			string += splitString[i];

			if(i != (index + size - 1))
				string = string.concat(" "); 
		}

		res.send({"string": string});
	})
})

app.get('/r/:sessionId/slides', function(req, res) {
	const sessionId = req.params.sessionId;
	const index = req.query.index ? parseInt(req.query.index) : 0;
	const data = req.query.data ? req.query.data : false;

	var path = null;

	if(slides[sessionId]) {
		if(index < slides[sessionId].length) {
			if(data)
				res.send({"result": slides[sessionId][index]});
			else
				// Depending on what Unreal needs we will have to do one of the two things:
				// Send the actual image file as a download
				//res.sendFile(slides[sessionId][index].location, {root: __dirname});
				// Or send image file as content of the url response
				path = slides[sessionId][index].location;
		} else {
			if(data)
				res.send({"result": slides[sessionId][slides[sessionId].length-1]});
			else
				// res.sendFile(slides[sessionId][slides[sessionId].length-1].location, {root: __dirname});
				path = slides[sessionId][slides[sessionId].length-1].location;
		}

		if(path) {
			fs.readFile(path, function(err, content) {
				if(err) {
					res.writeHead(400, {'Content-type':'text/html'});
					console.log(err);
					res.end("No such image");
				} else {
					res.writeHead(200, {'Content-type':'image/png'});
					res.end(content);
				}
			});
		}
	} else {
		res.send({"error": "No slides found for current presentation"});
	}
})

app.post('/r/:sessionId/presentation', upload.array('files'), function(req, res) {
	res.send({"success": "Got presentation for session " + req.params.sessionId});
	console.log("Presentation for session " + req.params.sessionId + " uploaded");

	var slideArray = req.files.map(function(currentValue) {
		return {
			slide: parseInt(currentValue.originalname.replace(/^\D+/g, '').replace('.png', '')),
			name: currentValue.originalname,
			location: currentValue.path
		}
	});

	slideArray = slideArray.sort(function(a, b){return a.slide - b.slide});
	slides[req.params.sessionId] = slideArray;
})

http.listen(3000, function() {
	console.log('listening on port 3000');
});

function codeForSession(sessionId) {
	var code = sessionId.slice(0, 4).toUpperCase();
	code = code.replace("-", "H");
	return code;
}