$(document).ready(function() {
	$("#shuffle").click(function() {
		shuffle = !shuffle;
		$("#shuffle > div > svg")[0].style.fill = (shuffle ? "#0F0" : "#000");
	});

	$("#skip").mousedown(function() {
		if(isInitiated()) nextSong(player.songNumber);
	});
});

function getSongElement(id) {
	var obj = $('*[data-num="' + id + '"]');

	return {
		 id: obj[0].getAttribute("data-num"),
		 yt: obj[0].getAttribute("data-yt"),
		 artist: obj[0].children[1].innerHTML,
		 name: obj[0].children[2].innerHTML,
	};
}

function startSong(songID, num) {
	player.stopVideo();
	player.loadVideoById(songID);

	player.songNumber = num;

	setTitle(getSongElement(num));

	//Highlight
	$("#musictable tr").removeClass("highlight");
    $("#" + num).addClass("highlight");
	play();
}

function nextSong(currentID) {
	currentID = Number(currentID);

	if(shuffle) {
		currentID = Math.floor((Math.random() * songAmount) + 1);
	} else {
		currentID = currentID + 1;
	}

	var songInfo = getSongElement(currentID);
	startSong(songInfo.yt, currentID);
}

function loadfile(loadid) {
	if(!window.FileReader) {
		document.getElementById(loadid).value = 'Your browser does not support HTML5 "FileReader" function required to open a file.';
	} else {
		fileis = document.getElementById("file").files[0];
		var fileredr = new FileReader();
		fileredr.onload = function(fle) {
			var filecont = fle.target.result;
			var lines = filecont.split('\n');
			var comp = "";
		    for(var y = 0; y < lines.length; y++){
		      comp += lines[y] + "||";
		    }
			post("upload.php", {songs: comp});
		}
		fileredr.readAsText(fileis);
	}
}

function post(path, params, method) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
	form.setAttribute("target", "myIframe");

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

	var iframe = document.createElement("iframe");
	iframe.src = path;
	iframe.name = "myIframe";
	iframe.style.width = '1px';
	iframe.style.height = '1px';
	iframe.style.visibility = 'hidden';
	iframe.style.position = 'absolute';
	iframe.style.right = '0';
	iframe.style.bottom = '0';
	form.appendChild(iframe);

	// Create an input
	var mapInput = document.createElement("input");
	mapInput.type = "hidden";
	mapInput.name = "uploaded";
	mapInput.value = iframe.name;

	// Add the input to the form
	form.appendChild(mapInput);

    document.body.appendChild(form);
    form.submit();
	document.body.removeChild(form);
}
