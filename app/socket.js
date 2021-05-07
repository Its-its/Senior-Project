var mysql 		= require('mysql');
var dbconfig 	= require('../config/database').playlists;
var connection;
var createPlaylist, addToPlaylist;

function handleDisconnect() {
	connection = mysql.createConnection(dbconfig.connection);

	connection.connect(function(err) {
		if(err) setTimeout(handleDisconnect, 2000);
	});

	connection.on('error', function(err) {
		if(err.code === 'PROTOCOL_CONNECTION_LOST') handleDisconnect();
		else throw err;
	});

	connection.query('USE ' + dbconfig.database);
}

handleDisconnect();

createPlaylist = function(id) {
	connection.query("CREATE TABLE `?` (`id` VARCHAR(16)  NOT NULL, `name` VARCHAR(32)  NOT NULL, `artist`  VARCHAR(32)  NOT NULL, `length`  VARCHAR(32)  NOT NULL, PRIMARY KEY(`id`)) ENGINE = MyISAM;", [ id ]);
}

addToPlaylist = function(playlistID, songID) {

}

module.exports = function(io, core) {
	io.on('connect', function(socket) {
		var userID = (socket.request.session.passport == null ? null : socket.request.session.passport.user);

		if(userID != null) {
			var playlists = core.accounts.getPlaylists(userID);

			for(var i = 0; i < playlists.length; i++) {
				var list = playlists[i];
				connection.query("SELECT * FROM `?`", [ list.id ], function(err, rows) {
					if(err) return;
					var listName = list.name;

					socket.emit('playlist', {
						  type	: "create"
						, name	: listName
						, songs	: rows
					});
				});
			}
		}

		socket.on('playlist', function(obj) {
			if(userID == null) return;

			var playlists = core.accounts.getPlaylists(userID);

			if(obj.type == "update") {
				/**
				 * obj.add = { *:[] }
				 * obj.rem = { *:[] }
				 *
				 */

				for (var id in obj.add) {
					if(contains(playlists, id)) {
						var toAdd = obj.add[id];
						if(toAdd.length == 0) continue;

						var all = "";
						for (var i = 0; i < toAdd.length; i++) {
							all += "'" + toAdd[i] + "',"
						}
						all.splice(-1);

						connection.query("DELETE FROM `` WHERE (id) IN ('fss','asd',)", [ id ], function(err) {
							if(err) console.log(err);
						});
					}
				}

				for (var id in obj.rem) {
					if(contains(playlists, id)) {
						var toRemove = obj.rem[id];
						if(toRemove.length == 0) continue;

						var all = "";
						for (var i = 0; i < toRemove.length; i++) {
							all += "'" + toRemove[i] + "',"
						}
						all.splice(-1);

						connection.query("DELETE FROM `?` WHERE (id) IN ('fss','asd',)", [ id ], function(err) {
							if(err) console.log(err);
						});
					}
				}
			}
		});

		function contains(array, str) {
			for (var i = 0; i < array.length; i++) {
				if(array[i] == str) return true;
			}
			return false;
		}

		//Join room and create room.
		socket.on('room', function(room) {
			room = room.toLowerCase();
			socket.join(room);
			if(!core.createRoom(room)) {
				if(core.getRoom(room).isSongPlaying()) socket.emit('chat', core.getRoom(room).getVideoInfo());
			}
		});

		//Chat messages
		socket.on('chat', function(object) {
			var date = new Date();
			if(userID == null) {
				socket.emit('chat', {
					type	: "info",
					message	: "Please login to type!",
					age		: date
				});
			} else {
				io.sockets.in(object.room.toLowerCase()).emit('chat', {
					type	: "msg",
					message	: object.message,
					username: core.accounts.getByID(userID),
					age		: date
				});
			}
		});

		//Video stuff
		socket.on('video', function(object) {
			if(userID == null) return;

			var name = core.accounts.getByID(userID);

			if(object.type == "request") {
				core.getRoom(object.room.toLowerCase()).addSongRequest(object.id, name.toLowerCase());
			} else if(object.type == "unrequest") {
				core.getRoom(object.room.toLowerCase()).remSongRequest(name.toLowerCase());
			} else if(object.type == "upvote") {
				core.getRoom(object.room.toLowerCase()).upvote(name.toLowerCase());
			} else if(object.type == "downvote") {
				core.getRoom(object.room.toLowerCase()).downvote(name.toLowerCase());
			}
		});

		//IDEA: I should pick whether I should convert the room stuffs to this one.
		function roomName() {
			var name = socket.handshake.headers.referer.split("/");
			return (name[name.length - 1] ? name[name.length - 1] : name[name.length - 2])
		}
	});

	io.on('disconnect', function(socket) {
		//TODO: Implement only one room at a time.
	});
};
