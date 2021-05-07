var requestVideo = null;

$(document).ready(function() {
	var   io 			= window.io
		, socket 		= io.connect()

	var roomName 		= window.location.pathname.replace("/", "");

	$('#chat-send').click(function() {
		sendChatMessage($("#chat-field").val());
	});

	$("#upvote").click(function() {
		$("#downvote").css("color", "black");
		$(this).css("color", "green");
		socket.emit('video', { type: "upvote", room: roomName });
	});

	$("#downvote").click(function() {
		$("#upvote").css("color", "black");
		$(this).css("color", "green");
		socket.emit('video', { type: "downvote", room: roomName });
	});

	socket.on('playlist', function(obj) {
		if(obj.type == "create") {
			createPlaylists.push(obj);
			createPlaylist();
		}
	});

	socket.on('chat', function(msg) {
		onRecieveChatMessage(msg);
	});

	setTimeout(function() {
		init();
	}, 2000);

	function init() {
		connectToRoom();
		$(".loading-container").toggle();
	}

	function connectToRoom() {
		socket.emit('room', roomName);
	}

	function removePlayingScreen() {
		$("#nothing-playing").css("display", "none");
	}

	function sendChatMessage(message) {
		$("#chat-field").val("");

		if(message.startsWith("/username")) {
			socket.emit('name', message.split(" ")[1]);
		} else if(message.startsWith("/request")) {
			requestVideo(message.split(" ")[1]);
		} else socket.emit('chat', { room: roomName, message: message });
	}

	requestVideo = function(id) {
		socket.emit('video', { room: roomName, id: id, type: "request" });
	}

	function onRecieveChatMessage(object) {
		if(object.type == "msg") {
			addChatMessage(compilePlayerMessage(object));
		} else if(object.type == "username") {
			if(object.successful) {
				addChatMessage(compileInfoMessage(object));
			} else {
				addChatMessage(compileInfoMessage(object));
			}
		} else if(object.type == "info") {
			addChatMessage(compileInfoMessage(object));
		} else if(object.type == "video") {
			if (object.id == null) {
				$("#nothing-playing").css("display", "");
			} else {
				startVideo(object.id, object.name);
				removePlayingScreen();
				if(object.start != 0) setVideoTime(object.start/1000);
			}
		} else if(object.type == "update") {
			//object.songRequests
			//object.users
			//object.skipRequests
			$("#upvotes").html(object.upvotes);
			$("#downvotes").html(object.downvotes);
		}
	}

	function compileInfoMessage(object) {
		//age, message
		var message = object.message;
		var age = new Date().toLocaleTimeString();
		return "<li class=\"left clearfix\"><span class=\"chat-img pull-left\"><img src=\"http://placehold.it/50/FF0000/fff&text=!!!\" alt=\"User Avatar\" class=\"img-circle\" /></span><div class=\"chat-body clearfix\"><div class=\"header\"><strong class=\"primary-font\" style=\"color:yellow\">Information</strong><small class=\"pull-right text-muted\"><span class=\"glyphicon glyphicon-time\"></span>" + age + "</small></div><p>" + message + "</p></div></li>";
	}

	function compilePlayerMessage(object) {
		//username, age, message
		var age = new Date(object.age).toLocaleTimeString();
		var username = object.username;
		var message = object.message;
		var pic = object.username.slice(0, 1);
		return "<li class=\"left clearfix\"><span class=\"chat-img pull-left\"><img src=\"http://placehold.it/50/55FF57/fff&text=" + pic + "\" alt=\"User Avatar\" class=\"img-circle\" /></span><div class=\"chat-body clearfix\"><div class=\"header\"><strong class=\"primary-font\">" + username + "</strong><small class=\"pull-right text-muted\"><span class=\"glyphicon glyphicon-time\"></span>" + age + "</small></div><p>" + message + "</p></div></li>";
	}

	function addChatMessage(html) {
		$('#chat').append(html);
	}
});
