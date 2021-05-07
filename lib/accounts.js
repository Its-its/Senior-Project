module.exports = inject;

function inject(core) {
	core.accounts = {
		  sockets			: {}
		, playlists			: {}
		, names				: []
		, check				: []
		, add				: add
		, addFromDatabase	: addFromDatabase
		, getPlaylists		: getPlaylists
		, remove			: remove
		, getByID			: getByID
		, exists			: exists
	};

	function add(id, name) {
		console.log("Adding username");

		this.sockets[Number(id)] = name;
		this.names.push(name);
		this.check.push(name.toLowerCase());
	}

	function addFromDatabase(user) {
		console.log("Adding user from Database");

		user.id = Number(user.id);
		this.sockets[user.id] = user.username;
		this.names.push(user.username);
		this.check.push(user.username.toLowerCase());
		this.playlists[user.id] = (user.playlists == null ? [] : JSON.parse(user.playlists));
	}

	function getPlaylists(id) {
		return this.playlists[Number(id)];
	}

	function remove(id) {
		console.log("Removing user w/ id " + id);

		id = Number(id);
		if (this.sockets[id] !== undefined) {
			var indexOf = this.names.indexOf(this.sockets[id]);

			this.names.splice(indexOf, 1);
			this.check.splice(indexOf, 1);

			delete this.sockets[id];
			delete this.playlists[id];
		}
	}

	function getByID(id) {
		console.log("Getting username by id");

		id = Number(id);
		if (this.sockets[id] !== undefined) {
			return this.sockets[id];
		} else {
			return null;
		}
	}

	function exists(name) {
		return this.check.indexOf(name.toLowerCase()) > -1;
	}
}
