//Globals
// - isPlaylistReady
// - activePlaylist
// - playlists

var isPlaylistReady = false;
var activePlaylist = 0;
var lastSongPosition = 0;
var playlists = [];
var playlistUpdates = [];


$("#toggle-playlist").click(function() {
	$("#playlist").toggle();
	//$(".video-frame").toggle();
});

//Tabs
$("#search-media").keypress(function(event) {
	if(event.which != 13) return;

	search($("#search-media").val());

	$('div[role="tabpanel"]').removeClass('active');
	$('li[role="presentation"]').removeClass('active');
	$('#search-media-div').addClass('active');

	event.preventDefault();
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	e.target // new tab
	e.relatedTarget // previous tab
	$('#search-media-div').removeClass('active');
})

//

function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

function onYouTubeApiLoad() {
    gapi.client.setApiKey('');
	isPlaylistReady = true;
	initPlaylist();
}

function initPlaylist() {
	if(!isPlaylistReady) return;
	createPlaylist();
}

// Search for a specified string.
function search(name) {
	var request = gapi.client.youtube.search.list({
		  q: name
		, part: "snippet"
		, maxResults: 25
		, type: "video"
	});

	request.execute(function(response) {
		if(response.code == 400) return;

		$("#search-media-div").html("");

		console.log(response.items);

		for (var i = 0; i < response.items.length; i++) {
			var item = response.items[i];

			var id   = item.id.videoId;
			var name = document.createTextNode(item.snippet.channelTitle + " | " + item.snippet.title);

			$("#search-media-div").append(createSongRow(id, name, null));
		}

		$("a.song").click(function() {
			requestVideo($(this).attr("ytID"));
		});
	});
}

var createPlaylists = [];

function createPlaylist() {
	if(!isPlaylistReady) return;

	for (var i = 0; i < createPlaylists.length; i++) {
		var play = createPlaylists[i];

		var obj = {};
		obj.name = play.name;
		obj.songs = play.songs;
		playlists[playlists.length] = obj;
		addPlaylist(play.name, play.songs);
	}

	createPlaylists.length = 0;

	$("a.song").click(function() {
		requestVideo($(this).attr("ytID"));
	});
}

function addPlaylist(name, songs) {
	var button = '<li role="presentation"><a href="#playlist-' + playlists.length + '" aria-controls="playlist-' + playlists.length + '" role="tab" data-toggle="tab" class="button"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="playlist-name">' + name + '</span></a></li>';
	var list = '<ul class="song-table" role="tabpanel" class="tab-pane" id="playlist-' + playlists.length + '"></ul>';

	$("#main-buttons").append(button);
	$("#main-lists").append(list);

	var parsedSongs = "";

	for (var i = 0; i < songs.length; i++) {
		parsedSongs += songs[i].id + ",";
	}

	var request = gapi.client.youtube.videos.list({
		  id: parsedSongs
		, part: "id,snippet,contentDetails"
	});

	request.execute(function(response) {
		console.log(response);
		if(response.code == 403) return;

		var items = response.items;

		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			var id   = item.id;
			var time = document.createTextNode(changeTime(item.contentDetails.duration));
			var name = document.createTextNode(item.snippet.channelTitle + " | " + item.snippet.title);

			$("#playlist-" + playlists.length).append(createSongRow(id, name, time));
		}
	});
}

function createSongRow(id, name, time) {
	var tableRow = document.createElement("li");
	tableRow.className = "song";
	tableRow.setAttribute("ytID", id);

	var img = document.createElement("img");
	img.src = "http://img.youtube.com/vi/" + id + "/0.jpg";

	var partImage = document.createElement("div");
	partImage.className = "song-img";
	partImage.appendChild(img);

	var partName = document.createElement("div");
	partName.className = "name";
	partName.appendChild(name);

	tableRow.appendChild(partImage);
	tableRow.appendChild(partName);

	if (time != null) {
		var partTime = document.createElement("div");
		partTime.className = "time";
		partTime.appendChild(time);
		tableRow.appendChild(partTime);
	}

	return tableRow;
}

function changeTime(ytTime) {
	return ytTime.replace("PT", "").replace("S", "").replace("M", ":").replace("H", ":");
}

window.onbeforeunload = function() {}
