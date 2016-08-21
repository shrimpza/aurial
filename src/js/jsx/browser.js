var ArtistList = React.createClass({
	getDefaultProps: function() {
		return {};
	},

	getInitialState: function() {
		return {
			artists: [],
			loaded: false,
			error: null,
			search: "",
			uid: UniqueID()
		};
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
		$('#' + this.state.uid).accordion({exclusive: false});
	},

	search: function(e) {
		this.setState({search: e.target.value});
	},

	render: function() {
		var _this = this;
		var artists = this.state.artists
			.filter(function (artist) {
				return _this.state.search == '' || artist.name.toLowerCase().indexOf(_this.state.search.toLowerCase()) !== -1;
			})
			.map(function (artist) {
				return (
					<Artist key={artist.id} subsonic={_this.props.subsonic} events={_this.props.events} data={artist} iconSize={_this.props.iconSize} />
				);
			});

		if (!this.state.loaded && artists.length == 0) {
			artists = <div className="ui inverted active centered inline loader"></div>
		}

		return this.state.error || (
			<div className="ui inverted basic segment">
				<div className="ui inverted transparent fluid left icon input">
					<i className="search icon"></i>
					<input type="text" placeholder="Search..." value={this.state.search} onChange={this.search}/>
				</div>
				<div className="ui inverted divider"></div>
				<div className="ui inverted fluid accordion" id={this.state.uid}>
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
		var albums = this.state.albums.map(function (album) {
			return (
				<Album key={album.id} subsonic={_this.props.subsonic} events={_this.props.events} data={album} iconSize={_this.props.iconSize} />
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
				this.props.events.publish({event: "browserSelected", data: {tracks: data.album}});
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
