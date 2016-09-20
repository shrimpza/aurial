import React from 'react'
import moment from 'moment'
import {IconMessage,CoverArt,Prompt,InputPrompt} from './common'
import TrackList from './tracklist'
import {SecondsToTime,UniqueID} from '../util'

export default class PlaylistManager extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.loadPlaylists = this.loadPlaylists.bind(this);
		this.loadPlaylist = this.loadPlaylist.bind(this);
	}

	loadPlaylists() {
		this.refs.selector.loadPlaylists();
	}

	loadPlaylist(id) {
		this.refs.playlist.loadPlaylist(id);
	}

	render() {
		return (
			<div className="playlistManager">
				<PlaylistSelector ref="selector" subsonic={this.props.subsonic} iconSize={this.props.iconSize} selected={this.loadPlaylist} />
				<Playlist ref="playlist" subsonic={this.props.subsonic} events={this.props.events} iconSize={this.props.iconSize} changed={this.loadPlaylists} />
			</div>
		);
	}
}

class PlaylistSelector extends React.Component {

	state = {
		playlists: []
	}

	constructor(props, context) {
		super(props, context);
		this.loadPlaylists();

		this.loadPlaylists = this.loadPlaylists.bind(this);
	}

	componentDidMount() {
		$('.playlistSelector .dropdown').dropdown({
			action: 'activate',
			onChange: function(value, text, selectedItem) {
				this.props.selected(value);
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
			}.bind(this)
		});
	}

	render() {
		var playlists = [];
		if (this.state.playlists) {
			playlists = this.state.playlists.map(function (playlist) {
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
		return (
			<div className="item" data-value={this.props.data.id}>
				<CoverArt subsonic={this.props.subsonic} id={this.props.data.coverArt} size={this.props.iconSize} />
				<span className="description">{this.props.data.songCount} tracks, {SecondsToTime(this.props.data.duration)}</span>
				<span className="text">{this.props.data.name}</span>
			</div>
		);
	}
}

class Playlist extends React.Component {

	state = {
		playlist: null
	}

	constructor(props, context) {
		super(props, context);
		this.loadPlaylist = this.loadPlaylist.bind(this);
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

	render() {
		if (!this.state.playlist) {
			return (
				<div className="playlistView">
					<IconMessage icon="info circle" header="Nothing Selected!" message="Select a playlist." />
				</div>
			);

		} else {
			return (
				<div className="ui basic segment playlistView">
					<PlaylistInfo events={this.props.events} subsonic={this.props.subsonic} playlist={this.state.playlist} changed={this.props.changed} />
					<TrackList subsonic={this.props.subsonic} tracks={this.state.playlist.entry} events={this.props.events}
						playlist={this.state.playlist.id} iconSize={this.props.iconSize} />
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
