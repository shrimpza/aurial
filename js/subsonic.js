/**
 * Subsonic API client.
 *
 * Exposes methods to make requests to Subsonic API endpoints, given the 
 * configuration provided at initialisation time.
 *
 * In addition to whatever input the API methods require, success and failure
 * callbacks may be provided to consume output. For example:
 * 
 * subsonic.ping({
 *   success: function(response) {
 *     // use response
 *   }, 
 *   failure: function(status, message) {
 *     // ...
 *   }
 * })
 */
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
			p: "enc:" + this.password.hexEncode(),
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

	this.ping = function(params) {
		$.ajax({
			url: this.getUrl('ping', {}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				params.success(data['subsonic-response']);
			},
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}
		});
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

				var ignoredArticles = data['subsonic-response'].artists.ignoredArticles.split(' ');
				allArtists.sort(function(a, b) {
					var at = a.name;
					var bt = b.name;
					for (var i = ignoredArticles.length - 1; i >= 0; i--) {
						if (at.indexOf(ignoredArticles[i] + ' ') == 0) at = at.replace(ignoredArticles[i] + ' ', '');
						if (bt.indexOf(ignoredArticles[i] + ' ') == 0) bt = bt.replace(ignoredArticles[i] + ' ', '');
					};
					return at.localeCompare(bt);
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
				var albums = data['subsonic-response'].artist.album;

				if (albums.length > 1) {
					albums.sort(function(a, b) {
						return (a.year || 0) - (b.year || 0);
					});
				}

				params.success({albums: albums});
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

	this.search = function(params) {
		$.ajax({
			url: this.getUrl('search3', {query: params.query, songCount: params.songCount}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				params.success(data['subsonic-response'].searchResult3);
			}.bind(this),
			error: function(xhr, status, err) {
				params.error(status, err.toString());
			}.bind(this)
		});
	}

	this.getStreamUrl = function(params) {
		return this.getUrl('stream', {id: params.id, format: params.format ? params.format : 'mp3'});
	}

}
