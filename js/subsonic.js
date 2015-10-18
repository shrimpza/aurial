Subsonic = function(url, user, password, version, appName) {
	this.url = url;
	this.user = user;
	this.password = password;
	this.version = version;
	this.appName = appName;

	this.getUrl = function(func, params) {
		var result = this.url + "/rest/" + func + ".view?";
		var _params = {
			u: this.user,
			p: this.password,
			v: this.version,
			c: appName,
			f: "json"
		};

		$.each(_params, function(k, v) {
			result += k + "=" + v + "&";
		});

		$.each(params, function(k, v) {
			result += k + "=" + v + "&";
		});

		return result;
	}

	this.getArtists = function(params) {
		$.ajax({
			url: this.getUrl('getArtists', {}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				var allArtists = [];
				data['subsonic-response'].artists.index.map(function(letter) {
					letter.artist.map(function(artist) {
						allArtists.push(artist);
					});
				});

				params.success({artists: allArtists});
			},
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}
		});
	}

	this.getArtist = function(params) {
		$.ajax({
			url: this.getUrl('getArtist', {id: params.id}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				params.success({albums: data['subsonic-response'].artist.album});
			},
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}
		});
	}

	this.getAlbum = function(params) {
		$.ajax({
			url: this.getUrl('getAlbum', {id: params.id}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				params.success({album: data['subsonic-response'].album});
			},
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}
		});
	}

	this.getPlaylists = function(params) {
		$.ajax({
			url: this.getUrl('getPlaylists', {}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				params.success({playlists: data['subsonic-response'].playlists.playlist});
			},
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}
		});
	}

	this.getPlaylist = function(params) {
		$.ajax({
			url: this.getUrl('getPlaylist', {id: params.id}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				params.success({playlist: data['subsonic-response'].playlist.entry});
			}.bind(this),
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}.bind(this)
		});
	}

	this.getStreamUrl = function(params) {
		return this.getUrl('stream', {id: params.id});
	}

}
