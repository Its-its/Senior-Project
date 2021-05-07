module.exports = inject;

function inject(core) {
	function Room(name) {
		var currentSong 	= null;
		var requests 		= [];
		var users 			= [];
		var skipRequests 	= 0;
		var upvotes 		= 0;
		var userUpvotes		= [];
		var downvotes 		= 0;
		var userDownvotes	= [];
		var roomName 		= name;
		var history			= [];

		function update() {
			if(!isSongPlaying()) {
				changeVideo();
			}

			core.io.sockets.in(roomName).emit('chat', {
				  type			: "update"
				, songRequests 	: requests
				, users 		: users
				, upvotes 		: upvotes
				, downvotes		: downvotes
				, skipRequests 	: skipRequests
			});
		}

		function addSongRequest(songID, user) {
			requests.push({ id: songID, user: user });
			core.log("Added: " + songID + " to queue. queue size: " + requests.length);
			update();
		}

		function remSongRequest(user) {
			for (var i = 0; i < requests.length; i++) {
				if(requests[i].user == user) {
					requests.splice(i, 1);
					break;
				}
			}
			update();
		}

		function startVideo() {
			core.log("Starting: " + currentSong.name + ", " + (currentSong.length/1000) + "s, " + currentSong.id);
			core.io.sockets.in(roomName).emit('chat', {
				  type	: "video"
				, id 	: currentSong.id
				, name	: currentSong.name
				, time	: currentSong.length
				, start : 0
			});

			requests.splice(0, 1);

			setTimeout(function() {
				core.log("Changing Video!");
				changeVideo();
			}, currentSong.length);
		}

		function changeVideo() {
			if(requests.length == 0) {
				currentSong = null;
				core.log("Nothing to play.");
				core.io.sockets.in(roomName).emit('chat', {
					  type	: "video"
					, id	: null
				});
				return;
			}

			var video = requests[0];
			core.youtube.getById(video.id, function(error, result) {
				if(error) {
					requests.splice(0, 1);
					changeVideo();
					return;
				}

				//TODO: There has to be a better way to do this.
				var time = result.items[0].contentDetails.duration.replace("PT", "");
				if(time.indexOf("H") != -1) {
					time = time.replace("S", "").split("M");
					time2 = time[0].split("H");
					time = (Number(time2[0]) * 3600000) + (Number(time2[1]) * 60000) + (Number(time[1]) * 1000);
				} else if(time.indexOf("M") != -1) {
					time = time.replace("S", "").split("M");
					time = (Number(time[0]) * 60000) + (Number(time[1]) * 1000);
				} else {
					time = time.replace("S", "");
					time = (Number(time[0]) * 1000);
				}

				var name = result.items[0].snippet.title;

				var date = new Date().getTime();

				currentSong = {
					id		: video.id,
					name	: name,
					length	: time,
					started	: date
				};
				startVideo();
			});
		}

		function getVideoInfo() {
			var date = new Date().getTime();

			return {
				  type	: "video"
				, id	: currentSong.id
				, name	: currentSong.name
				, length: currentSong.length
				, start : (date - currentSong.started)
			}
		}

		function resetAll() {
			skipRequests = 0;
			upvote = 0;
			downvotes = 0;
			userUpvotes.length = 0;
			userDownvotes.length = 0;
		}

		function removeUser(username) {
			var index = users.indexOf(username);
			if(index == -1) return;
			users.splice(index, 1);
		}

		function addUser(username) {
			users.push(username);
		}

		function upvote(username) {
			var down = userDownvotes.indexOf(username);

			if(userUpvotes.indexOf(username) != -1) return;
			else if(down != -1) {
				downvotes--;
				userDownvotes.splice(down, 1);
			}

			userUpvotes.push(username);
			upvotes++;
			update();
		}

		function downvote(username) {
			var up = userUpvotes.indexOf(username);

			if(userDownvotes.indexOf(username) != -1) return;
			else if(up != -1) {
				upvotes--;
				userUpvotes.splice(up, 1);
			}

			userDownvotes.push(username);
			downvotes++;
			update();
		}

		function size() {
			return Object.lengthOf(core.io.sockets.adapter.rooms[roomName]);
		}

		function isSongPlaying() {
			return currentSong != null;
		}

		return {
			  isSongPlaying	: isSongPlaying
			, name			: roomName
			, update		: update
			, addSongRequest: addSongRequest
			, remSongRequest: remSongRequest
			, startVideo	: startVideo
			, changeVideo	: changeVideo
			, size			: size
			, addUser		: addUser
			, removeUser	: removeUser
			, getVideoInfo 	: getVideoInfo
			, upvote		: upvote
			, downvote 		: downvote
		};
	};

	function createRoom(room) {
		if(typeof activeRooms[room] == "undefined") {
			core.log("Created room: " + room.toUpperCase());
			activeRooms[room] = new Room(room);
			return true;
		}
		return false;
	}

	function getRoom(name) {
		return activeRooms[name];
	}

	var activeRooms = {};

	core.createRoom = createRoom;
	core.getRoom = getRoom;
	core.Room = Room;
}

Object.lengthOf = function(obj) {
	var length = 0;
	for (var variable in object) {
		length++;
	}
	return length;
}
