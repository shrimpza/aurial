var App = React.createClass({
	getInitialState: function() {
		return {subsonic: this.props.subsonic};
	},

	render: function() {
		console.log("state is ", this.state.subsonic);

		var events = new EventBus();

		var player = <Player subsonic={this.state.subsonic} events={events} />;

		var playlists = <PlaylistManager subsonic={this.state.subsonic} events={events} iconSize="20" />;
		var selection = <Selection subsonic={this.state.subsonic} events={events} iconSize="20" />;
		var queue = <PlaylistQueue subsonic={this.state.subsonic} events={events} iconSize="20" />;

		var artistList = <ArtistList subsonic={this.state.subsonic} events={events} iconSize="30" />;

		var settings = <Settings subsonic={this.state.subsonic} events={events} app={this} />;

		var tabs = [];
		tabs.push({id:"selection", title: "Selection", active: true, icon: "chevron right"});
		tabs.push({id:"playlists", title: "Playlists", icon: "list"});
		tabs.push({id:"playing", title: "Playing", icon: "play"});
		tabs.push({id:"settings", title: "Settings", icon: "setting"});

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
						<div id="settings" data-tab="settings" className="ui tab">{settings}</div>
					</div>
				</div>
			</div>
		);
	}
});