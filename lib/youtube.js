module.exports = inject;

var YouTube = require('youtube-node');

function inject(core) {
	var youTube = new YouTube();
	youTube.setKey('');
	core.youtube = youTube;
}
