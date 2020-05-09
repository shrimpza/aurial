import {h, Component} from 'preact';
import moment from 'moment'
import {IconMessage,CoverArt,Prompt,InputPrompt,ListPrompt} from './common'
import TrackList from './tracklist'
import {SecondsToTime,UniqueID} from '../util'
import {Messages} from './app'

export default class PlaylistManager extends Component {

	state = {
		playlists: [],
		playlist: null
	}

	constructor(props, context) {
		super(props, context);

		this.loadPlaylists = this.loadPlaylists.bind(this);
		this.loadPlaylist = this.loadPlaylist.bind(this);
		this.createPlaylist = this.createPlaylist.bind(this);
		this.updatePlaylist = this.updatePlaylist.bind(this);
		this.receive = this.receive.bind(this);

		this.loadPlaylists();

		props.events.subscribe({
			subscriber: this,
			event: ["playlistManage"]
		});
	}


	componentDidUpdate(prevProps, prevState) {
		if (prevProps.subsonic !== this.props.subsonic) this.loadPlaylists();
	}

	receive(event) {
		if (event.event === "playlistManage") {
			if (event.data.action === "ADD") {
				this.lister.show(function(approved, playlist) {
					if (!approved) return;

					var tracks = event.data.tracks.map(t => t.id);

					var currentPlaylist = this.state.playlists.find(p => p.id === playlist)

					if (currentPlaylist === undefined) {
						this.createPlaylist(playlist, tracks);
					} else {
						this.updatePlaylist(playlist, tracks, []);
					}
				}.bind(this));
			} else if (event.data.action === "CREATE") {
				this.creator.show("", function(approved, newName) {
					if (!approved) return;

					this.createPlaylist(newName, []);
				}.bind(this));
			} else if (event.data.action === "DELETE") {
				this.deleter.show(function(approved) {
					if (!approved) return;

					this.props.subsonic.deletePlaylist({
						id: event.data.id,
						success: function() {
							this.loadPlaylists();
							Messages.message(this.props.events, "Playlist deleted", "warning", "trash");
						}.bind(this)
					});
				}.bind(this));
			} else if (event.data.action === "RENAME") {
				this.renamer.show(event.data.name, function(approved, newName) {
					if (!approved) return;

					this.props.subsonic.updatePlaylist({
						id: event.data.id,
						name: newName,
						success: function() {
							this.loadPlaylists();
							Messages.message(this.props.events, "Playlist renamed", "success", "edit");
						}.bind(this)
					});
				}.bind(this));
			} else if (event.data.action === "REMOVE") {
				// load up the playlist, since we can only remove tracks by their index within a playlist
				this.props.subsonic.getPlaylist({
					id: event.data.id,
					success: function(data) {
						var tracks = event.data.tracks.map(function(t) {
							for (var i = 0; i < data.playlist.entry.length; i++) {
								if (t.id === data.playlist.entry[i].id) return i;
							}
						});

						this.updatePlaylist(event.data.id, [], tracks);
					}.bind(this),
					error: function(err) {
						console.error(this, err);
						Messages.message(this.props.events, "Unable to load playlist: " + err.message, "error", "warning sign");
					}.bind(this)
				});
			}
		}
	}

	createPlaylist(name, trackIds) {
		this.props.subsonic.createPlaylist({
			name: name,
			tracks: trackIds,
			success: function() {
				Messages.message(this.props.events, "New playlist " + name + " created", "success", "checkmark");
				this.loadPlaylists();
			}.bind(this),
			error: function(err) {
				console.error(this, err);
				Messages.message(this.props.events, "Failed to create playlist: " + err.message, "error", "warning sign");
			}.bind(this)
		});
	}

	updatePlaylist(id, add, remove) {
		this.props.subsonic.updatePlaylist({
			id: id,
			add: add,
			remove: remove,
			success: function() {
				Messages.message(this.props.events, "Playlist updated", "success", "checkmark");
				this.loadPlaylists();
				if (this.state.playlist !== null && id === this.state.playlist.id) this.loadPlaylist(id);
			}.bind(this),
			error: function(err) {
				console.error(this, err);
				Messages.message(this.props.events, "Failed to update playlist: " + err.message, "error", "warning sign");
			}.bind(this)
		});
	}

	loadPlaylists() {
		this.props.subsonic.getPlaylists({
			success: function(data) {
				this.setState({playlists: data.playlists});
				if (this.state.playlist != null) {
					this.loadPlaylist(this.state.playlist.id);
				}
			}.bind(this),
			error: function(err) {
				console.error(this, err);
				Messages.message(this.props.events, "Unable to get playlists: " + err.message, "error", "warning sign");
			}.bind(this)
		});
	}

	loadPlaylist(id) {
		this.props.subsonic.getPlaylist({
			id: id,
			success: function(data) {
				this.setState({playlist: data.playlist});
			}.bind(this),
			error: function(err) {
				console.error(this, err);
				Messages.message(this.props.events, "Unable to load playlist: " + err.message, "error", "warning sign");
			}.bind(this)
		});
	}

	render() {
		var playlists = [];
		if (this.state.playlists) {
			playlists = this.state.playlists.map(function (playlist) {
				return (
					<PlaylistSelectorItem key={playlist.id} subsonic={this.props.subsonic} data={playlist} iconSize={this.props.iconSize} simple={true} />
				);
			}.bind(this));
		}

		return (
			<div className="playlistManager">
				<InputPrompt ref={(r) => {this.creator = r;}} title="Create Playlist" message="Enter a name for the new playlist" />
				<InputPrompt ref={(r) => {this.renamer = r;}} title="Rename Playlist" message="Enter a new name for this playlist" />
				<Prompt ref={(r) => {this.deleter = r;}} title="Delete Playlist" message="Are you sure you want to delete this playlist?" ok="Yes" icon="red trash" />
				<ListPrompt ref={(r) => {this.lister = r;}} title="Add to playlist" message="Choose a playlist to add tracks to" ok="Add" icon="teal list"
					defaultText="Playlists..." allowNew={true} items={playlists} />

				<PlaylistSelector subsonic={this.props.subsonic} events={this.props.events} iconSize={this.props.iconSize} playlists={this.state.playlists} selected={this.loadPlaylist} />
				<Playlist subsonic={this.props.subsonic} events={this.props.events} iconSize={this.props.iconSize} playlist={this.state.playlist} changed={this.loadPlaylists} />
			</div>
		);
	}
}

class PlaylistSelector extends Component {

	defaultProps = {
		playlists: []
	}

	constructor(props, context) {
		super(props, context);

		this.value = null;

		this.create = this.create.bind(this);
	}

	componentDidMount() {
		$('.playlistSelector .dropdown').dropdown({
			action: 'activate',
			onChange: function(value, text, selectedItem) {
				if (this.value !== value) {
					if (this.props.selected) this.props.selected(value);
					this.value = value;
				}
			}.bind(this)
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.value) $('.playlistSelector .dropdown').dropdown('set selected', this.value);
	}

	create() {
		this.props.events.publish({event: "playlistManage", data: {action: "CREATE"}});
	}

	render() {
		var playlists = [];
		if (this.props.playlists) {
			playlists = this.props.playlists.map(function (playlist) {
				return (
					<PlaylistSelectorItem key={playlist.id} subsonic={this.props.subsonic} data={playlist} iconSize={this.props.iconSize} />
				);
			}.bind(this));
		}

		return (
			<div className="ui basic segment playlistSelector">
				<div className="ui grid">
					<div className="thirteen wide column">
						<div className="ui fluid selection dropdown">
							<i className="dropdown icon"></i>
							<div className="default text">Playlists...</div>
							<div className="menu">
								{playlists}
							</div>
						</div>
					</div>
					<div className="three wide column">
						<button className="ui fluid labelled icon teal button" onClick={this.create}><i className="plus icon"></i> New Playlist</button>
					</div>
				</div>
			</div>
		);
	}
}

class PlaylistSelectorItem extends Component {
	render() {
		var description = !this.props.simple
		? <span className="description">{this.props.data.songCount} tracks, {SecondsToTime(this.props.data.duration)}</span>
		: null;

		return (
			<div className="item" data-value={this.props.data.id}>
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} />
				{description}
				<span className="text">{this.props.data.name}</span>
			</div>
		);
	}
}

class Playlist extends Component {

	defaultProps = {
		playlist: null
	}

	constructor(props, context) {
		super(props, context);
	}

	render() {
		if (!this.props.playlist) {
			return (
				<div className="playlistView">
					<IconMessage icon="info circle" header="Nothing Selected!" message="Select a playlist." />
				</div>
			);
		} else {
			return (
				<div className="ui basic segment playlistView">
					<PlaylistInfo events={this.props.events} subsonic={this.props.subsonic} playlist={this.props.playlist} changed={this.props.changed} />
					<TrackList subsonic={this.props.subsonic} tracks={this.props.playlist.entry} events={this.props.events}
						playlist={this.props.playlist.id} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
}

class PlaylistInfo extends Component {

	constructor(props, context) {
		super(props, context);

		this.play = this.play.bind(this);
		this.enqueue = this.enqueue.bind(this);
		this.delete = this.delete.bind(this);
		this.rename = this.rename.bind(this);
	}

	play() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "REPLACE", tracks: this.props.playlist.entry}});
		this.props.events.publish({event: "playerPlay", data: this.props.playlist.entry[0]});
	}

	enqueue() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: this.props.playlist.entry}});
	}

	delete() {
		this.props.events.publish({event: "playlistManage", data: {action: "DELETE", id: this.props.playlist.id}});
	}

	rename() {
		this.props.events.publish({event: "playlistManage", data: {action: "RENAME", id: this.props.playlist.id, name: this.props.playlist.name}});
	}

	render() {
		return (
			<div className="ui items">
				<div className="item">
					<div className="ui small image">
						<CoverArt subsonic={this.props.subsonic} id={this.props.playlist.coverArt} size={200} events={this.props.events} />
					</div>
					<div className="aligned content">
						<div className="header">
							<div>{this.props.playlist.name}</div>
						</div>
						<div className="meta">
							<div>Added: {moment(this.props.playlist.created).format("ll")}</div>
							<div>Updated: {moment(this.props.playlist.changed).format("ll")}</div>
							<div>{this.props.playlist.songCount} tracks, {SecondsToTime(this.props.playlist.duration)}</div>
						</div>
						<div className="extra">
							<button className="ui small compact labelled icon green button" onClick={this.play}><i className="play icon"></i> Play</button>
							<button className="ui small compact labelled icon olive button" onClick={this.enqueue}><i className="plus icon"></i> Add to Queue</button>
							<button className="ui small compact labelled icon grey button" onClick={this.rename}><i className="edit icon"></i> Rename</button>
							<button className="ui small compact labelled icon red button" onClick={this.delete}><i className="trash icon"></i> Delete</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
