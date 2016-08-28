import React from 'react'
import Events from '../events'
import PlayerExtras from '../playerextra'
import Player from './player'
import {PlaylistManager,Selection,PlaylistQueue} from './playlist'
import ArtistList from './browser'
import {TabGroup} from './common'
import Settings from './settings'

import '../../style/app.scss'

export default class App extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.events = new Events();
	}

	render() {

		var player = <Player subsonic={this.props.subsonic} events={this.events} />;

		var playlists = <PlaylistManager subsonic={this.props.subsonic} events={this.events} iconSize="20" />;
		var selection = <Selection subsonic={this.props.subsonic} events={this.events} iconSize="20" />;
		var queue = <PlaylistQueue subsonic={this.props.subsonic} events={this.events} iconSize="20" />;

		var artistList = <ArtistList subsonic={this.props.subsonic} events={this.events} iconSize="30" />;

		var settings = <Settings subsonic={this.props.subsonic} events={this.events} />;

		var tabs = [];
		tabs.push({id:"selection", title: "Selection", active: true, icon: "chevron right"});
		tabs.push({id:"playlists", title: "Playlists", icon: "teal list"});
		tabs.push({id:"playing", title: "Queue", icon: "olive play"});
		tabs.push({id:"settings", title: "Settings", icon: "setting"});

		var tabGroup = <TabGroup tabs={tabs} iconSize="20" />;

		var playerExtras = new PlayerExtras(this.props.subsonic, this, this.events);

		return (
			<div id="frames">
				<div id="browser">
					<div id="artistList">{artistList}</div>
				</div>
				<div id="background-layer"></div>
				<div id="player">{player}</div>
				<div id="playlist">
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
}
