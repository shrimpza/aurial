var App = React.createClass({
	render: function() {
		var events = new EventBus();

		var player = <Player subsonic={this.props.subsonic} events={events} />;

		var playlists = <PlaylistManager subsonic={this.props.subsonic} events={events} iconSize="20" />;
		var selection = <Selection subsonic={this.props.subsonic} events={events} iconSize="20" />;
		var queue = <PlaylistQueue subsonic={this.props.subsonic} events={events} iconSize="20" />;

		var artistList = <ArtistList subsonic={this.props.subsonic} events={events} iconSize="30" />;

		var settings = <Settings subsonic={this.props.subsonic} events={events} />;

		var tabs = [];
		tabs.push({id:"selection", title: "Selection", active: true, icon: "chevron right"});
		tabs.push({id:"playlists", title: "Playlists", icon: "teal list"});
		tabs.push({id:"playing", title: "Queue", icon: "olive play"});
		tabs.push({id:"settings", title: "Settings", icon: "setting"});

		var tabGroup = <TabGroup tabs={tabs} iconSize="20" />;

		var playerExtras = new PlayerExtras(this.props.subsonic, this, events);

		return (
			<div>
				<div id="browser-frame">
					<div id="artistList">{artistList}</div>
				</div>
				<div id="background-layer"></div>
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

/**
  * app bootstrap
  */
$(document).ready(function() {
	soundManager.setup({
		url: '//cdnjs.cloudflare.com/ajax/libs/soundmanager2/2.97a.20150601/swf/',
		flashVersion: 9,
		preferFlash: false,
		useFastPolling: true,
		onready: function() {
			// Ready to use; soundManager.createSound() etc. can now be called.
		}
	});

	var subsonic = new Subsonic(localStorage.getItem('url') || 'http://localhost:4040/',
								localStorage.getItem('username') || '',
								localStorage.getItem('password') || '',
								"1.14.0", "Aurial");

	ReactDOM.render(
		<App subsonic={subsonic} />,
		document.getElementById("app")
	);
});
