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

var PlaylistManager = React.createClass({
	getInitialState: function() {
		this.playlist = null;

		return {playlists: []};
	},

	componentDidMount: function() {
		this.loadPlaylists();
	},

	loadPlaylists: function() {
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

	loadPlaylist: function(id) {
		$.ajax({
			url: this.props.subsonic.getUrl('getPlaylist', {id: id),
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
		if (this.playlist == null) this.playlist = <Playlist subsonic={this.props.subsonic} iconSize={this.props.iconSize} />

		return (
			<div>
				<PlaylistSelector subsonic={this.props.subsonic} playlists={this.state.playlists} iconSize={this.props.iconSize} selected={this.loadPlaylist} />
				{this.playlist}
			</div>
		);
	}
});


var PlaylistSelector = React.createClass({
	componentDidMount: function() {
		$('.playlistSelector').dropdown({
			action: 'hide',
			onChange: function(value, text, $selectedItem) {
				this.props.selected(value);
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
			<div className="ui fluid selection dropdown playlistSelector">
				<i className="dropdown icon"></i>
				<div className="default text">Playlists...</div>
				<div className="menu">
					{playlists}
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
				<span className="description">{this.props.data.songCount}, {this.props.data.duration.asTime()}</span>
				<span className="text">{this.props.data.name}</span>
			</div>
		);
	}
})

var Playlist = React.createClass({

	getInitialState: function() {
		return {playlist: [], id: null};
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
