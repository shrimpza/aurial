var CoverArt = React.createClass({
	render: function() {
		return (
			<img className="ui image" src={this.props.subsonic.getUrl("getCoverArt", {id:this.props.id, size:this.props.size})}/>
		);
	}
});

var Album = React.createClass({
	render: function() {
		var year = this.props.data.year ? '[' + this.props.data.year + ']' : '';
		return (
			<div className="item">
				<div className="ui image label">
					<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize}/>
					{year} {this.props.data.name} ({this.props.data.songCount})
				</div>
			</div>
		);
	}
});

var Artist = React.createClass({
	getInitialState: function() {
		return {albums: []};
	},

	loadAlbums: function() {
		$.ajax({
			url: this.props.subsonic.getUrl('getArtist', {id: this.props.data.id}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({albums: data['subsonic-response'].artist.album});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	onClick: function() {
		if (this.state.albums.length == 0) {
			this.loadAlbums();
		}
	},

	render: function() {
		var _this = this;
		var albums = this.state.albums.map(function (album) {
			return (
				<Album key={album.id} subsonic={_this.props.subsonic} data={album} iconSize={_this.props.iconSize} />
			);
		});

		return (
			<div key={this.props.data.id} onClick={this.onClick}>
				<div className="title">
					<i className="dropdown icon"></i>
					{this.props.data.name} ({this.props.data.albumCount})
				</div>
				<div className="ui selection list content">
					{albums}
				</div>
			</div>
		);
	}
});

var ArtistList = React.createClass({
	getInitialState: function() {
		return {artists: []};
	},

	componentDidMount: function() {
		$.ajax({
			url: this.props.subsonic.getUrl('getArtists', {}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				var allArtists = [];
				data['subsonic-response'].artists.index.map(function(letter) {
					letter.artist.map(function(artist) {
						allArtists.push(artist);
					});
				});

				this.setState({artists: allArtists});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	render: function() {
		var _this = this;
		var artists = this.state.artists.map(function (artist) {
			return (
				<Artist key={artist.id} subsonic={_this.props.subsonic} data={artist} iconSize={_this.props.iconSize} />
			);
		});

		return (
			<div className="ui styled fluid accordion">
				{artists}
			</div>
		);
	}
});


var PlaylistItem = React.createClass({
	render: function() {
		return (
			<tr>
				<td>
					{this.data.track}
				</td>
				<td>
					{this.data.artist}
				</td>
				<td>
					{this.data.title}
				</td>
				<td>
					<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize}/>
					{this.data.album}
				</td>
				<td>
					{this.data.year}
				</td>
				<td>
					{this.data.duration}
				</td>
			</tr>
		);
	}
});

var Playlist = React.createClass({

	getInitialState: function() {
		return {playlist: []};
	},

	componentDidMount: function() {
		this.loadPlaylist(); // TODO only load this when selecting the tab
	},

	loadPlaylist: function() {
		$.ajax({
			url: this.props.subsonic.getUrl('getPlaylist', {id: this.props.data.id}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({playlist: data['subsonic-response'].playlist.entry});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	render: function() {
		var _this = this;
		var playlist = this.state.playlist.map(function (entry) {
			return (
				<PlaylistItem key={entry.id} subsonic={_this.props.subsonic} data={entry} iconSize={_this.props.iconSize} />
			);
		});

		return (
			<table className="ui selectable compact table">
				<thead>
					<tr>
						<th>#</th>
						<th>Artist</th>
						<th>Title</th>
						<th>Album</th>
						<th>Date</th>
						<th>Duration</th>
					</tr>
				</thead>
				<tbody>
					{playlist}
				</tbody>
			</table>
		);
	}
});

var PlaylistTab = React.createClass({
	render: function() {
		return (
			<a className="item playlistTab" data-tab={this.props.data.id} onClick={this.props.onClick}>
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize}/>
				{this.props.data.name}
			</a>
		);
	}
});

var PlaylistTabContent = React.createClass({
	render: function() {
		return (
			<div className="ui bottom attached tab segment" data-tab={this.props.data.id}>
				<Playlist key={this.props.data.id} subsonic={this.props.subsonic} iconSize={this.props.iconSize} data={this.props.data}/>
			</div>
		);
	}
});

var PlaylistCollection = React.createClass({
	getInitialState: function() {
		return {playlists: []};
	},

	componentDidMount: function() {
		$.ajax({
			url: this.props.subsonic.getUrl('getPlaylists', {}),
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({playlists: data['subsonic-response'].playlists.playlist});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	componentDidUpdate: function() {
		$('.playlistTab').tab();
	},

	render: function() {
		var _this = this;
		var playlistTabs = this.state.playlists.map(function (playlist) {
			return (
				<PlaylistTab key={playlist.id} subsonic={_this.props.subsonic} data={playlist} iconSize={_this.props.iconSize} />
			);
		});
		var playlistContents = this.state.playlists.map(function (playlist) {
			return (
				<PlaylistTabContent key={playlist.id} subsonic={_this.props.subsonic} data={playlist} iconSize={_this.props.iconSize} />
			);
		});

		return (
			<div>
				<div className="ui top attached tabular menu">
					{playlistTabs}
				</div>
				{playlistContents}
			</div>
		);
	}
});