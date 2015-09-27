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
			<div className="ui inverted basic segment">
				<div className="ui inverted fluid accordion">
					{artists}
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
	render: function() {
		var year = this.props.data.year ? '[' + this.props.data.year + ']' : '';
		return (
			<div className="item">
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} />
				<div className="content">
					<div className="header">{this.props.data.name}</div>
					<div className="description">{year} {this.props.data.songCount} tracks</div>
					<div className="extra">
						
					</div>
				</div>
				{/*<div className="ui inverted right floated compact basic tiny icon button">
					<i className="play icon"></i>
				</div>*/}
			</div>
		);
	}
});
