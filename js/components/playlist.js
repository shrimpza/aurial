var PlaylistManager = React.createClass({
	getInitialState: function() {
		return {playlists: [], playlist: []};
	},

	componentDidMount: function() {
		this.loadPlaylists();
	},

	loadPlaylists: function() {
		this.props.subsonic.getPlaylists({
			success: function(data) {
				this.setState({playlists: data.playlists});
			}.bind(this),
			error: function(status, err) {
				console.error(this, status, err.toString());
			}.bind(this)
		});
	},

	loadPlaylist: function(id) {
		this.props.subsonic.getPlaylist({
			id: id,
			success: function(data) {
				this.setState({playlist: data.playlist});
			}.bind(this),
			error: function(status, err) {
				console.error(this, status, err.toString());
			}.bind(this)
		});
	},

	render: function() {
		//var hash = 1;
		//this.state.playlists.map(function (playlist) {
		//	hash += 31 * playlist.id;
		//});

		return (
			<div className="playlistManager">
				<PlaylistSelector subsonic={this.props.subsonic} playlists={this.state.playlists} iconSize={this.props.iconSize} selected={this.loadPlaylist} />
				<Playlist subsonic={this.props.subsonic} player={this.props.player} iconSize={this.props.iconSize} playlist={this.state.playlist} />
			</div>
		);
	}
});


var PlaylistSelector = React.createClass({
	componentDidMount: function() {
		var _this = this;
		$('.playlistSelector .dropdown').dropdown({
			action: 'activate',
			onChange: function(value, text, $selectedItem) {
				_this.props.selected(value);
			}
		});
	},

	render: function() {
		var _this = this;
		var playlists = this.props.playlists.map(function (playlist) {
			return (
				<PlaylistSelectorItem key={playlist.id} subsonic={_this.props.subsonic} data={playlist} iconSize={_this.props.iconSize} />
			);
		});

		return (
			<div className="ui basic segment playlistSelector">
				<div className="ui fluid selection dropdown">
					<i className="dropdown icon"></i>
					<div className="default text">Playlists...</div>
					<div className="menu">
						{playlists}
					</div>
				</div>
			</div>
		);
	}
});

var PlaylistSelectorItem = React.createClass({
	render: function() {
		return (
			<div className="item" data-value={this.props.data.id}>
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} />
				<span className="description">{this.props.data.songCount} tracks, {this.props.data.duration.asTime()}</span>
				<span className="text">{this.props.data.name}</span>
			</div>
		);
	}
})

var Playlist = React.createClass({
	render: function() {
		if (this.props.playlist.length == 0) {
			return (
				<div className="playlistView">
					<IconMessage icon="info circle" header="Nothing Selected!" message="Select a playlist." />
				</div>
			);

		} else {
			return (
				<div className="ui basic segment playlistView">
					<TrackList subsonic={this.props.subsonic} subsonic={this.props.subsonic} player={this.props.player} tracks={this.props.playlist} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
});

var Selection = React.createClass({
	getInitialState: function() {
		return {album: null};
	},

	render: function() {
		if (this.state.album == null) {
			return (
				<IconMessage icon="info circle" header="Nothing Selected!" message="Select an album from the browser." />
			);

		} else {
			return (
				<div className="ui basic segment selectionView">
					<TrackList subsonic={this.props.subsonic} player={this.props.player} tracks={this.state.album.song} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
});

var TrackList = React.createClass({
	render: function() {
		var _this = this;
		var tracks = this.props.tracks.map(function (entry) {
			return (
				<Track key={entry.id} subsonic={_this.props.subsonic} player={_this.props.player} data={entry} iconSize={_this.props.iconSize} />
			);
		});

		return (
			<table className="ui selectable single line very basic compact table trackList">
				<thead>
					<tr>
						<th className="controls">&nbsp;</th>
						<th className="number">#</th>
						<th className="artist">Artist</th>
						<th className="title">Title</th>
						<th className="album">Album</th>
						<th className="date">Date</th>
						<th className="right aligned duration">Duration</th>
					</tr>
				</thead>
				<tbody>
					{tracks}
				</tbody>
			</table>
		);
	}
});

var Track = React.createClass({
	onClick: function() {
		this.props.player().setState({playing: this.props.data});
	},

	render: function() {
		return (
			<tr>
				<td>
					<i className="grey play icon" onClick={this.onClick}></i>
				</td>
				<td>
					{this.props.data.track}
				</td>
				<td>
					{this.props.data.artist}
				</td>
				<td>
					{this.props.data.title}
				</td>
				<td>
					{/* <CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} /> */}
					{this.props.data.album}
				</td>
				<td>
					{this.props.data.year}
				</td>
				<td className="right aligned">
					{this.props.data.duration.asTime()}
				</td>
			</tr>
		);
	}
});
