import React from 'react'
import moment from 'moment'
import {IconMessage,CoverArt,Prompt,InputPrompt,ListPrompt} from './common'
import TrackList from './tracklist'
import {SecondsToTime,UniqueID} from '../util'

export default class PlaylistManager extends React.Component {

	state = {
		playlists: [],
		playlist: null
	}

	constructor(props, context) {
		super(props, context);

		this.loadPlaylists = this.loadPlaylists.bind(this);
		this.loadPlaylist = this.loadPlaylist.bind(this);
		this.showList = this.showList.bind(this);
		this.receive = this.receive.bind(this);

		this.loadPlaylists();

		props.events.subscribe({
			subscriber: this,
			event: ["playlistManage"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "playlistManage":
			if (event.data.action == "ADD") {
				this.showList(function(playlist) {
					alert("selected: " + playlist);
				});
			} else if (event.data.action == "CREATE") {
				// make a playlist etc
			}
			break;
		}
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
			}.bind(this)
		});
	}

	showList(approve) {
		this.refs.lister.show(approve);
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
				<ListPrompt ref="lister" title="Add to playlist" message="Choose a playlist to add tracks to" ok="Add" icon="teal list" items={playlists} />
				<PlaylistSelector subsonic={this.props.subsonic} iconSize={this.props.iconSize} playlists={this.state.playlists} selected={this.loadPlaylist} />
				<Playlist subsonic={this.props.subsonic} events={this.props.events} iconSize={this.props.iconSize} playlist={this.state.playlist} changed={this.loadPlaylists} />
			</div>
		);
	}
}

class PlaylistSelector extends React.Component {

	defaultProps = {
		playlists: []
	}

	constructor(props, context) {
		super(props, context);
	}

	componentDidMount() {
		$('.playlistSelector .dropdown').dropdown({
			action: 'activate',
			onChange: function(value, text, selectedItem) {
				if (this.props.selected) this.props.selected(value);
			}.bind(this)
		});
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
				<div className="ui fluid selection dropdown">
					<i className="dropdown icon"></i>
					<div className="default text">Playlists...</div>
					<div className="menu">
						{playlists}
					</div>
				</div>
			</div>
		);
	}
}

class PlaylistSelectorItem extends React.Component {
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

class Playlist extends React.Component {

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

class PlaylistInfo extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.play = this.play.bind(this);
		this.enqueue = this.enqueue.bind(this);
		this.delete = this.delete.bind(this);
		this.rename = this.rename.bind(this);
		this.showRename = this.showRename.bind(this);
		this.showDelete = this.showDelete.bind(this);
	}

	play() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "REPLACE", tracks: this.props.playlist.entry}});
		this.props.events.publish({event: "playerPlay", data: this.props.playlist.entry[0]});
	}

	enqueue() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: this.props.playlist.entry}});
	}

	delete() {
		this.props.subsonic.deletePlaylist({
			id: this.props.playlist.id,
			success: this.props.changed.bind(this)
		});
	}

	rename(name) {
		this.props.subsonic.updatePlaylist({
			id: this.props.playlist.id,
			name: name,
			success: this.props.changed.bind(this)
		});
	}

	showDelete() {
		this.refs.deleter.show();
	}

	showRename() {
		this.refs.renamer.show();
	}

	render() {
		return (
			<div className="ui items">
				<InputPrompt ref="renamer" title="Rename Playlist" message="Enter a new name for this playlist" value={this.props.playlist.name} approve={this.rename} />
				<Prompt ref="deleter" title="Delete Playlist" message="Are you sure you want to delete this playlist?" ok="Yes" icon="red warning circle" approve={this.delete} />
				<div className="item">
					<div className="ui small image">
						<CoverArt subsonic={this.props.subsonic} id={this.props.playlist.coverArt} size={200} />
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
							<button className="ui small compact labelled icon grey button" onClick={this.showRename}><i className="edit icon"></i> Rename</button>
							<button className="ui small compact labelled icon red button" onClick={this.showDelete}><i className="trash icon"></i> Delete</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
