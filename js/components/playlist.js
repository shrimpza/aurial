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
				if (data['subsonic-response'].playlists.playlist) {
					this.setState({playlists: data['subsonic-response'].playlists.playlist});
				}
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
			<div className="playlists">
				<div className="ui top attached compact tabular menu">
					{playlistTabs}
				</div>
				<div className="playlistContent">
					{playlistContents}
				</div>
			</div>
		);
	}
});

var PlaylistTab = React.createClass({
	render: function() {
		return (
			<a className="item playlistTab" data-tab={this.props.data.id} onClick={this.props.onClick}>
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} />
				{this.props.data.name}
			</a>
		);
	}
});

var PlaylistTabContent = React.createClass({
	render: function() {
		return (
			<div className="ui bottom attached tab segment playlist" data-tab={this.props.data.id}>
				<Playlist key={this.props.data.id} subsonic={this.props.subsonic} data={this.props.data} iconSize={this.props.iconSize} />
			</div>
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
				if (data['subsonic-response'].playlist.entry) {
					this.setState({playlist: data['subsonic-response'].playlist.entry});
				}
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
			<table className="ui selectable single line very basic compact table">
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

var PlaylistItem = React.createClass({
	render: function() {
		return (
			<tr>
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
				<td>
					{this.props.data.duration}
				</td>
			</tr>
		);
	}
});
