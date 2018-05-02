const mysql = require('mysql');
const connection = mysql.createConnection({
	host		: 'localhost',
	user		: 'app',
	password	: 'present123',
	database	: 'presentvr'
});

module.exports = {
	openConnection: connection.connect(),
	getAllSessions: function() {
		connection.query('SELECT * FROM sessions', function (error, results, fields) {
			        if (error) throw error;
			        console.log('The results are: ', results[0].sessionId);
		});
	},
	sessionExists: function(sessionId, completion) {
		const query = 'SELECT roomId FROM sessions WHERE EXISTS (SELECT sessionId FROM sessions WHERE sessionId = \'' + sessionId + '\');';
		connection.query(query, function (error, results, fields) {
			if (error) throw error;
			completion(results.length == 1);
		});
	},
	codeForSession:  function(sessionId, completion) {
		const query = 'SELECT roomId FROM sessions WHERE sessionId = \'' + sessionId + '\';';
		connection.query(query, function (error, results, fields) {
			if (error) throw error;
   			completion(results[0].roomId);
              	});
	},
	sessionForCode:  function(roomId, completion) {
                const query = 'SELECT sessionId FROM sessions WHERE roomId = \'' + roomId + '\';';
		connection.query(query, function (error, results, fields) {
	                if (error) throw error;
			if(results[0])
				completion(results[0].sessionId);
			else
				completion([]);
		});
	},
	insert: function(sessionId, roomId, completion) {
		const query = "INSERT INTO `sessions` (`id`, `sessionId`, `roomId`) VALUES (NULL, \'" + sessionId + "\', \'" + roomId + "\');";
		connection.query(query, function (error, results, fields) {
			if(error) throw error;
			completion(results);
		});
	},
	remove: function(sessionId, completion) {
		const query = "DELETE FROM `sessions` WHERE sessionId = \'" + sessionId + "\';";
		console.log(query);
		connection.query(query, function (error, results, fields) {
			if(error) throw error;
			completion(results);
		})
	},
	addTranscript: function(sessionId, transcript, completion) {
		const query = "UPDATE sessions SET transcript = \'" + transcript + "\' WHERE sessionId = \'" + sessionId + "\';"
		connection.query(query, function (error, results, fields) {
			if(error) throw error;
			completion(results);
		})
	},
	getTranscript: function(sessionId, completion) {
		const query = "SELECT `transcript` FROM `sessions` WHERE `sessionId` = \'" + sessionId + "\';";
		connection.query(query, function(error, results, fields) {
			if(error) throw error;
			if(results[0])
				completion(results[0].transcript);
		})
	},
	closeConnection: function(connection) {
		connection.close();
	}
}