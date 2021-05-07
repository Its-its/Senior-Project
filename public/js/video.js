var player;
var volume;

var autoplay 	= true;
var shuffle 	= false;
var isOffline	= false;

onPlayerAPIReady();

$(document).ready(function() {
	$("#musictable").tablesorter();
	volume = $("#volume");

	volume.slider({
		min: 0,
		max: 100,
		value: 0,
		range: "min",
		animate: true,
		slide: function(event, ui) {
			setVolume(ui.value);
		}
	});
});

function startVideo(songID, name) {
	player.stopVideo();
	player.loadVideoById(songID);
	setTitle("Song: " + name);
	play();
}

function onPlayerAPIReady() {
	if(isInitiated()) return;
	player = new YT.Player('video', {
		height: '480',
		width: '854',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		},
		playerVars: {
			showinfo: 0,
			controls: 0,
			autoplay: 0,
			cc_load_policy: 0,
			disablekb: 1,
			iv_load_policy: 3,
			rel: 0,
			fs: 0
		}
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PAUSED && !isOffline) {
		player.playVideo();
    }// else if(event.data == YT.PlayerState.ENDED && isOffline) {
	//	if(shouldAutoplay()) nextSong(player.songNumber);
	//}
}

function onPlayerReady(event) {
	player.songNumber = 0;
	setVolume(volume.slider("value"));
}

function setVideoTime(time) {
	if(!isInitiated()) return;
	player.seekTo(time);
}

function setVolume(volume) {
	if(!isInitiated()) return;
	player.setVolume(volume);
}

function setTitle(songInfo) {
	$("#song-name").text(songInfo);
}

function shouldAutoplay() {
	return autoplay && isOffline;
}

function mute() {
	if(!isInitiated()) return;

}

function isMuted() {
	return false;
}

function snooze() {
	if(!isInitiated()) return;
}

function isSnoozed() {
	return false;
}

function pause() {
	if(!isOffline) return;
	player.pauseVideo();
	$("#pause").html('<div class="clearfix pbs"><svg class="icon icon-circle-play"><use xlink:href="#icon-circle-play"></use></svg></div>');
}

function play() {
	player.playVideo();
	if(isOffline) $("#pause").html('<div class="clearfix pbs"><svg class="icon icon-circle-pause"><use xlink:href="#icon-circle-pause"></use></svg></div>');
}

//Player Funtions
function isInitiated() {
	return player != null;
}

function isPaused() {
	return player.getPlayerState() == YT.PlayerState.PAUSED && isOffline;
}
