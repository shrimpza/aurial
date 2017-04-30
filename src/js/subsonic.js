import md5 from 'blueimp-md5'

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
export default class Subsonic {

	constructor(url, user, token, salt, version, appName) {
		this.url = url.endsWith('/') ? url.substring(0, url.length - 1) : url.trim();
		this.user = user;
		this.token = token;
		this.salt = salt;
		this.version = version;
		this.appName = appName;
	}

	static createToken(password, salt) {
		return md5(password + salt);
	}

	getUrl(func, params) {
		var result = this.url + "/rest/" + func + ".view?";
		var _params = {
			u: this.user,
			t: this.token,
			s: this.salt,
			v: this.version,
			c: this.appName,
			f: "json"
		};

		Object.keys(_params).forEach(function(k) {
			result += k + "=" + _params[k] + "&";
		});

		Object.keys(params).forEach(function(k) {
			if (Array.isArray(params[k])) {
				params[k].forEach(function(v) {
					result += k + "=" + v + "&";
				});
			} else {
				result += k + "=" + params[k] + "&";
			}
		});

		return result;
	}

	ping(params) {
		fetch(this.getUrl('ping', {}), {
			mode: 'cors',
			cache: 'no-cache'
		})
		.then(function(result) {
			result.json().then(function(data) {
				params.success(data['subsonic-response']);
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	getArtists(params) {
		fetch(this.getUrl('getArtists', {}), {
			mode: 'cors'
		})
		.then(function(result) {
			result.json().then(function(data) {
				var allArtists = [];

				// get artists from their letter-based groups into a flat collection
				data['subsonic-response'].artists.index.map(function(letter) {
					letter.artist.map(function(artist) {
						allArtists.push(artist);
					});
				});

				// sort artists ignoring the 'ignored articles', such as 'The' etc
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
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	getArtist(params) {
		fetch(this.getUrl('getArtist', {id: params.id}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				var albums = data['subsonic-response'].artist.album;

				if (albums.length > 1) {
					albums.sort(function(a, b) {
						return (a.year || 0) - (b.year || 0);
					});
				}

				params.success({albums: albums});
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	getAlbum(params) {
		fetch(this.getUrl('getAlbum', {id: params.id}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				var album = data['subsonic-response'].album;
				album.song.sort(function(a, b) {
					return a.discNumber && b.discNumber
					? ((a.discNumber*1000) + a.track) - ((b.discNumber*1000) + b.track)
					: a.track - b.track;
				});
				params.success({album: album});
			})
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	getPlaylists(params) {
		fetch(this.getUrl('getPlaylists', {}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				params.success({playlists: data['subsonic-response'].playlists.playlist});
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	getPlaylist(params) {
		fetch(this.getUrl('getPlaylist', {id: params.id}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				params.success({playlist: data['subsonic-response'].playlist});
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	createPlaylist(params) {
		fetch(this.getUrl('createPlaylist', {name: params.name, songId: params.tracks}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				if (data['subsonic-response'].status == "ok") {
					params.success();
				} else {
					params.error(data['subsonic-response'].error.message);
				}
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	updatePlaylist(params) {
		var options = {playlistId: params.id};
		if (params.name) options.name = params.name;
		if (params.comment) options.comment = params.comment;
		if (params.add) options.songIdToAdd = params.add;
		if (params.remove) options.songIndexToRemove = params.remove;

		fetch(this.getUrl('updatePlaylist', options), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				if (data['subsonic-response'].status == "ok") {
					params.success();
				} else {
					params.error(data['subsonic-response'].error.message);
				}
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	deletePlaylist(params) {
		fetch(this.getUrl('deletePlaylist', {id: params.id}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				if (data['subsonic-response'].status == "ok") {
					params.success();
				} else {
					params.error(data['subsonic-response'].error.message);
				}
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	search(params) {
		fetch(this.getUrl('search3', {query: params.query, songCount: params.songCount}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				params.success(data['subsonic-response'].searchResult3);
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	scrobble(params) {
		fetch(this.getUrl('scrobble', {id: params.id}), {
			mode: 'cors'
		}).then(function(result) {
			result.json().then(function(data) {
				params.success();
			});
		})
		.catch(function(error) {
			params.error(error);
		});
	}

	getStreamUrl(params) {
		return this.getUrl('stream', {
			id: params.id,
			format: params.format ? params.format : 'mp3',
			maxBitRate: params.bitrate ? params.bitrate : 0
		});
	}

}
