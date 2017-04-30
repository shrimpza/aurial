import React from 'react'
import Events from '../events'
import PlayerExtras from '../playerextra'
import Player from './player'
import Selection from './selection'
import PlaylistManager from './playlist'
import PlayerQueue from './queue'
import ArtistList from './browser'
import {TabGroup} from './common'
import Settings from './settings'
import {ArrayDeleteElement} from '../util'

export default class App extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.events = new Events();
	}

	render() {

		var player = <Player subsonic={this.props.subsonic} events={this.events} trackBuffer={this.props.trackBuffer} />;

		var selection = <Selection subsonic={this.props.subsonic} events={this.events} iconSize="20" />;
		var playlists = <PlaylistManager subsonic={this.props.subsonic} events={this.events} iconSize="20" />;
		var queue = <PlayerQueue subsonic={this.props.subsonic} events={this.events} iconSize="20" />;

		var artistList = <ArtistList subsonic={this.props.subsonic} events={this.events} iconSize="30" />;

		var settings = <Settings subsonic={this.props.subsonic} events={this.events} />;

		var messages = <Messages events={this.events} />;

		var tabs = [];
		tabs.push({id:"selection", title: "Selection", active: true, icon: "chevron right"});
		tabs.push({id:"playlists", title: "Playlists", icon: "teal list"});
		tabs.push({id:"playing", title: "Queue", icon: "olive play"});
		tabs.push({id:"settings", title: "Settings", icon: "setting"});

		var tabGroup = <TabGroup tabs={tabs} iconSize="20" />;

		var playerExtras = new PlayerExtras(this.props.subsonic, this, this.events);

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
				{messages}
			</div>
		);
	}
}

export class Messages extends React.Component {

	static defaultProps = {
		showTime: 8 // seconds
	}

	static message(events, message, type, icon) {
		events.publish({
			event: "message",
			data: {
				text: message,
				type: type,
				icon: icon
			}
		});
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			messages: []
		}

		props.events.subscribe({
			subscriber: this,
			event: ["message"]
		});

		this.receive = this.receive.bind(this);
		this.removeMessage = this.removeMessage.bind(this);
	}

	receive(event) {
		if (event.event == "message") {
			event.data._id = "msg" + Math.random();
			var msgs =  this.state.messages.slice();
			msgs.push(event.data);
			this.setState({messages: msgs});

			setTimeout(function() {
				this.removeMessage(event.data);
			}.bind(this), this.props.showTime * 1000);
		}
	}

	removeMessage(message) {
		var msgs =  this.state.messages.slice();
		ArrayDeleteElement(msgs, message);
		this.setState({messages: msgs});
	}

	render() {
		var anim = {
			animationDuration: ((this.props.showTime / 2) + 0.2) + "s",
			animationDelay: (this.props.showTime / 2) + "s"
		}

		var messages = this.state.messages.map(function(m) {
			var icon = m.icon ? <i className={m.icon + " icon"}></i> : null;
			return (
				<div className={"ui icon " + m.type + " message"} key={m._id} style={anim}>
					{icon}
					<p>{m.text}</p>
				</div>
			);
		});

		return (
			<div className="messages">
				{messages}
			</div>
		);
	}
}
