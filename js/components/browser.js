var ArtistList = React.createClass({
	_id: UniqueID(),

	getInitialState: function() {
		return {artists: [], loaded: false, error: null, filter: {}};
	},

	componentDidMount: function() {
		this.props.subsonic.getArtists({
			success: function(data) {
				this.setState({artists: data.artists, loaded: true, error: null});
			}.bind(this),
			error: function(status, err) {
				this.setState({error: <IconMessage type="negative" icon="warning circle" header="" message="Failed to load artists. Check settings." />, loaded: true});
			}.bind(this)
		})
	},

	componentDidUpdate: function() {
		$('#' + this._id).accordion({exclusive: false});
	},

	search: function(e) {
		e.preventDefault();

		var search = $(e.target).find("input").val();

		if (search == null || search == '') {
			this.setState({filter: {}});
		} else if (search.length < 3) {
			alert('Search term too short');
		} else {
			var filter = {};
			this.props.subsonic.search({
				query: search,
				songCount: 100,
				success: function(result) {
					if (result.artist) {
						result.artist
							.filter(function (artist) {
								return filter[artist.id] == null;
							})
							.forEach(function (artist) {
								filter[artist.id] = [];
							});
					}

					if (result.album) {
						result.album.forEach(function (album) {
							if (filter[album.artistId] == null) filter[album.artistId] = {};
							filter[album.artistId][album.id] = [];
						});
					}

					if (result.song) {
						result.song.forEach(function (song) {
							if (filter[song.artistId] == null) filter[song.artistId] = {};
							if (filter[song.artistId][song.albumId] == null) filter[song.artistId][song.albumId] = [];
							if (filter[song.artistId][song.albumId].indexOf(song.id) == -1) filter[song.artistId][song.albumId].push(song.id);
						});
					}

					this.setState({filter: filter});
				}.bind(this),
				error: function(status, error) {
					alert("Failed to search.\n\n" + error);
				}
			});
		}
	},

	render: function() {
		var _this = this;
		var artists = this.state.artists
			.filter(function (artist) {
				return Object.keys(_this.state.filter).length == 0 || _this.state.filter.hasOwnProperty(artist.id);
			})
			.map(function (artist) {
				return (
					<Artist key={artist.id} subsonic={_this.props.subsonic} events={_this.props.events} data={artist} iconSize={_this.props.iconSize} filter={_this.state.filter[artist.id]} />
				);
			});

		if (!this.state.loaded && artists.length == 0) {
			artists = <div className="ui inverted active centered inline loader"></div>
		}

		return this.state.error || (
			<div className="ui inverted basic segment">
				<form onSubmit={this.search}>
					<div className="ui inverted transparent fluid left icon input">
						<i className="search icon"></i>
						<input type="text" placeholder="Search..." />
					</div>
				</form>
				<div className="ui inverted divider"></div>
				<div className="ui inverted fluid accordion" id={this._id}>
					{artists}
				</div>
			</div>
		);
	}
});

var Artist = React.createClass({
	getInitialState: function() {
		return {albums: [], loaded: false};
	},

	loadAlbums: function() {
		this.props.subsonic.getArtist({
			id: this.props.data.id,
			success: function(data) {
				this.setState({albums: data.albums, loaded: true});
			}.bind(this),
			error: function(status, err) {
				console.error(this, status, err.toString());
			}.bind(this)
		});
	},

	onClick: function() {
		if (!this.state.loaded) {
			this.loadAlbums();
		}
	},

	render: function() {
		var _this = this;
		var albums = this.state.albums
			.filter(function (album) {
				return _this.props.filter == null || Object.keys(_this.props.filter).length == 0 || _this.props.filter.hasOwnProperty(album.id);
			})
			.map(function (album) {
			return (
				<Album key={album.id} subsonic={_this.props.subsonic} events={_this.props.events} data={album} iconSize={_this.props.iconSize} 
					filter={_this.props.filter != null ? _this.props.filter[album.id] : null}/>
			);
		});

		if (!this.state.loaded && albums.length == 0) {
			albums = <div className="ui inverted active centered inline loader"></div>
		}

		return (
			<div key={this.props.data.id} onClick={this.onClick}>
				<div className="title">
					<i className="dropdown icon"></i>
					{this.props.data.name} ({this.props.filter ? Object.keys(this.props.filter).length : this.props.data.albumCount})
				</div>
				<div className="ui secondary inverted segment content">
					<div className="ui inverted tiny selection list">
						{albums}
					</div>
				</div>
			</div>
		);
	}
});

var Album = React.createClass({

	onClick: function() {
		this.props.subsonic.getAlbum({
			id: this.props.data.id,
			success: function(data) {
				this.props.events.publish({event: "browserSelected", data: {tracks: data.album, highlight: this.props.filter}});
			}.bind(this),
			error: function(status, err) {
				console.error(this, status, err.toString());
			}.bind(this)
		});
	},

	render: function() {
		var year = this.props.data.year ? '[' + this.props.data.year + ']' : '';
		return (
			<div className="item" onClick={this.onClick}>
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} />
				<div className="content">
					<div className="header">{this.props.data.name}</div>
					<div className="description">{year} {this.props.data.songCount} tracks</div>
					<div className="extra">
					</div>
				</div>
			</div>
		);
	}
});
