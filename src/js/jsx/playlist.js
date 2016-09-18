import React from 'react'
import moment from 'moment'
import {IconMessage,CoverArt} from './common'
import TrackList from './tracklist'
import {SecondsToTime} from '../util'

export default class PlaylistManager extends React.Component {

	state = {
		playlists: [],
		playlist: {
			id: null,
			playlist: []
		}
	}

	constructor(props, context) {
		super(props, context);
		this.loadPlaylists();

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
				this.setState({playlist: {id: id, playlist: data.playlist}});
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
				<Playlist subsonic={this.props.subsonic} events={this.props.events} iconSize={this.props.iconSize} playlist={this.state.playlist} />
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
		if (!this.props.playlist.id) {
			return (
				<div className="playlistView">
					<IconMessage icon="info circle" header="Nothing Selected!" message="Select a playlist." />
				</div>
			);

		} else {
			return (
				<div className="ui basic segment playlistView">
					<TrackList subsonic={this.props.subsonic} subsonic={this.props.subsonic} tracks={this.props.playlist.playlist}
						 events={this.props.events} playlist={this.props.playlist.id} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
}
