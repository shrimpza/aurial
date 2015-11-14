var App = React.createClass({
	getPlayer: function() {
		return this._player;
	},

	render: function() {
		var events = new EventBus();

		var player = <Player subsonic={this.props.subsonic} events={events} ref={(c) => this._player = c} />;

		var playlists = <PlaylistManager subsonic={this.props.subsonic} events={events} player={this.getPlayer} iconSize="20" />;
		var selection = <Selection subsonic={this.props.subsonic} events={events} player={this.getPlayer} iconSize="20" />;
		var queue = <PlaylistQueue subsonic={this.props.subsonic} events={events} player={this.getPlayer} iconSize="20" />;

		var artistList = <ArtistList subsonic={this.props.subsonic} events={events} iconSize="30" />;

		var tabs = [];
		tabs.push({id:"selection", title: "Selection", active: true});
		tabs.push({id:"playlists", title: "Playlists"});
		tabs.push({id:"playing", title: "Playing"});

		var tabGroup = <TabGroup tabs={tabs} iconSize="20" />;

		return (
			<div>
				<div id="browser-frame">
					<div id="artistList">{artistList}</div>
				</div>
				<div id="player-frame">{player}</div>
				<div id="playlist-frame">
					<div id="playlist-menu">{tabGroup}</div>
					<div id="playlist-content">
						<div id="playlist-selection" data-tab="selection" className="ui active tab">{selection}</div>
						<div id="playlist-playlists" data-tab="playlists" className="ui tab">{playlists}</div>
						<div id="playlist-playing" data-tab="playing" className="ui tab">{queue}</div>
					</div>
				</div>
			</div>
		);
	}
});