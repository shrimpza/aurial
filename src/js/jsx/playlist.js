import React from 'react'
import moment from 'moment'
import {IconMessage,CoverArt} from './common'
import TrackList from './tracklist'
import {SecondsToTime,UniqueID} from '../util'

export default class PlaylistManager extends React.Component {

	state = {
		playlists: [],
		playlist: null
	}

	constructor(props, context) {
		super(props, context);
		this.loadPlaylists();

		this.loadPlaylists = this.loadPlaylists.bind(this);
		this.loadPlaylist = this.loadPlaylist.bind(this);
	}

	loadPlaylists() {
		this.props.subsonic.getPlaylists({
			success: function(data) {
				this.setState({playlists: data.playlists});
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

	render() {
		return (
			<div className="playlistManager">
				<PlaylistSelector subsonic={this.props.subsonic} playlists={this.state.playlists} iconSize={this.props.iconSize} selected={this.loadPlaylist} />
				<Playlist subsonic={this.props.subsonic} events={this.props.events} iconSize={this.props.iconSize} playlist={this.state.playlist} changed={this.loadPlaylists} />
			</div>
		);
	}
}

class PlaylistSelector extends React.Component {

	componentDidMount() {
		// TODO jquery crap https://github.com/shrimpza/aurial/issues/1
		$('.playlistSelector .dropdown').dropdown({
			action: 'activate',
			onChange: function(value, text, selectedItem) {
				this.props.selected(value);
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
					<TrackList subsonic={this.props.subsonic} tracks={this.props.playlist.entry}
						events={this.props.events} playlist={this.props.playlist.id} iconSize={this.props.iconSize} />
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
	}

	play() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "REPLACE", tracks: this.props.playlist.entry}});
		this.props.events.publish({event: "playerPlay", data: this.props.playlist.entry[0]});
	}

	enqueue() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: this.props.playlist.entry}});
	}

	delete() {
		// TODO delete playlist
	}

	rename() {
		this.refs.renamer.show();
	}

	render() {
		return (
			<div className="ui items">
				<PlaylistNamer ref="renamer" subsonic={this.props.subsonic} playlist={this.props.playlist} changed={this.props.changed}/>
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
							<button className="ui small compact labelled icon grey button" onClick={this.rename}><i className="edit icon"></i> Rename</button>
							<button className="ui small compact labelled icon red button" onClick={this.delete}><i className="trash icon"></i> Delete</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export class PlaylistNamer extends React.Component {
	_id = UniqueID();

	defaultProps = {
		playlist: null
	}

	// state = {
	// 	name: ""
	// }

	constructor(props, context) {
		super(props, context);

		this.state = {
			name: props.playlist.name
		}

		this.show = this.show.bind(this);
		this.change = this.change.bind(this);
	}

	componentDidMount() {
		$('#' + this._id).modal({
			onApprove : function() {
				this.saveName(this.props.playlist.id, this.state.name);
			}.bind(this)
		});
	}

	show() {
		$('#' + this._id).modal('show');
	}

	saveName(playlistId, name) {
		this.props.subsonic.updatePlaylist({
			playlistId: playlistId,
			name: name,
			success: function() {
				this.props.changed();
			}.bind(this)
		});
	}

	change(e) {
		switch (e.target.name) {
			case "name": this.setState({name: e.target.value}); break;
		}
	}

	render() {
		return (
			<div id={this._id} className="ui small modal">
				<i className="close icon"></i>
				<div className="header">
					Rename Playlist
				</div>
				<div className="content">
					<div className="description">
						<form className="ui form" onSubmit={function() {return false;}}>
							<div className="field">
								<label>Playlist Name</label>
								<input name="name" type="text" onChange={this.change} value={this.state.name} />
							</div>
						</form>
					</div>
				</div>
				<div className="actions">
					<div className="ui cancel button">Cancel</div>
					<div className="ui blue ok button">OK</div>
				</div>
			</div>
		);
	}
}
