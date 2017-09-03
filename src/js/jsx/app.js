import { h, Component } from 'preact';
import Events from '../events'
import PlayerExtras from '../playerextra'
import Player from './player'
import Selection from './selection'
import PlaylistManager from './playlist'
import PlayerQueue from './queue'
import ArtistList from './browser'
import {TabGroup, ImageViewer} from './common'
import Settings from './settings'
import {ArrayDeleteElement} from '../util'

export default class App extends Component {

	constructor(props, context) {
		super(props, context);

		this.state = {
			subsonic: props.subsonic,
			trackBuffer: props.trackBuffer,
			persistQueue: props.persistQueue
		}

		this.events = new Events();

		this.events.subscribe({
			subscriber: this,
			event: ["appSettings"]
		});
	}

	receive(event) {
		if (event.event == "appSettings") {
			if (this.playerExtras) this.playerExtras.terminate();
			this.setState({
				subsonic: event.data.subsonic,
				trackBuffer: event.data.trackBuffer,
				persistQueue: event.data.persistQueue
			});
		}
	}

	render() {
		var player = <Player subsonic={this.state.subsonic} events={this.events} trackBuffer={this.state.trackBuffer} persist={this.state.persistQueue} />;

		var selection = <Selection subsonic={this.state.subsonic} events={this.events} iconSize="20" />;
		var playlists = <PlaylistManager subsonic={this.state.subsonic} events={this.events} iconSize="20" />;
		var queue = <PlayerQueue subsonic={this.state.subsonic} events={this.events} iconSize="20" />;

		var artistList = <ArtistList subsonic={this.state.subsonic} events={this.events} iconSize="30" />;

		var settings = <Settings subsonic={this.state.subsonic} events={this.events} />;

		var messages = <Messages events={this.events} />;

		var tabs = [];
		tabs.push({id:"selection", title: "Selection", active: true, icon: "chevron right"});
		tabs.push({id:"playlists", title: "Playlists", icon: "teal list"});
		tabs.push({id:"playing", title: "Queue", icon: "olive play"});
		tabs.push({id:"settings", title: "Settings", icon: "setting"});

		var tabGroup = <TabGroup tabs={tabs} iconSize="20" />;

		this.playerExtras = new PlayerExtras(this.state.subsonic, this, this.events);

		return (
			<div>
				<Links />
				<ImageViewer title="Image Viewer" events={this.events} />
				<div className="browser-frame">
					<div className="artistList">{artistList}</div>
				</div>
				<div className="background-layer"></div>
				<div className="player-frame">{player}</div>
				<div className="playlist-frame">
					<div className="playlist-menu">{tabGroup}</div>
					<div className="playlist-content">
						<div className="playlist-selection ui active tab" data-tab="selection">{selection}</div>
						<div className="playlist-playlists ui tab" data-tab="playlists">{playlists}</div>
						<div className="playlist-playing ui tab" data-tab="playing">{queue}</div>
						<div className="settings ui tab" data-tab="settings">{settings}</div>
					</div>
				</div>
				{messages}
			</div>
		);
	}
}

export class Messages extends Component {

	static defaultProps = {
		showTime: 8 // seconds
	}

	static message(events, message, type, icon) {
		events.publish({
			event: "message",
			data: {
				text: message.toString(),
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

class Links extends Component {
	render() {
		return (
			<div className="links">
				<a href="https://github.com/shrimpza/aurial">
					<i className="github icon"></i>
					<span>Aurial on GitHub</span>
				</a>
			</div>
		);
	}
}
