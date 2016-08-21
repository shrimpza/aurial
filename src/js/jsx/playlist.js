import React from 'react'
import {IconMessage,CoverArt} from './common'

export class PlaylistManager extends React.Component {

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
	}

	loadPlaylists() {
		this.props.subsonic.getPlaylists({
			success: function(data) {
				this.setState({playlists: data.playlists});
			}.bind(this),
			error: function(status, err) {
				console.error(this, status, err.toString());
			}.bind(this)
		});
	}

	loadPlaylist(id) {
		this.props.subsonic.getPlaylist({
			id: id,
			success: function(data) {
				this.setState({playlist: {id: id, playlist: data.playlist}});
			}.bind(this),
			error: function(status, err) {
				console.error(this, status, err.toString());
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
			}
		}.bind(this));
	}

	render() {
		var playlists = [];
		if (this.props.playlists) {
			this.props.playlists.map(function (playlist) {
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
				<span className="description">{this.props.data.songCount} tracks, {this.props.data.duration.asTime()}</span>
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
					<TrackList subsonic={this.props.subsonic} subsonic={this.props.subsonic} tracks={this.props.playlist.playlist} events={this.props.events}
					iconSize={this.props.iconSize} playlist={this.props.playlist.id} />
				</div>
			);
		}
	}
}

export class Selection extends React.Component {
	state = {
		album: null
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["browserSelected"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "browserSelected": this.setState({album: event.data.tracks}); break;
		}
	}

	render() {
		if (this.state.album == null) {
			return (
				<IconMessage icon="info circle" header="Nothing Selected!" message="Select an album from the browser." />
			);

		} else {
			return (
				<div className="ui basic segment selectionView">
					<SelectionAlbum subsonic={this.props.subsonic} events={this.props.events} album={this.state.album} />
					<TrackList subsonic={this.props.subsonic} events={this.props.events} tracks={this.state.album.song} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
}

class SelectionAlbum extends React.Component {
	play() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "REPLACE", tracks: this.props.album.song}});
		this.props.events.publish({event: "playerPlay", data: this.props.album.song[0]});
	}

	enqueue() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: this.props.album.song}});
	}

	playlist() {
		// TODO add/create playlist
	}

	render() {
		return (
			<div className="ui items">
				<div className="item">
					<div className="ui small image">
						<CoverArt subsonic={this.props.subsonic} id={this.props.album.coverArt} size={200} />
					</div>
					<div className="aligned content">
						<div className="header">
							<div className="artist">{this.props.album.artist}</div>
							<div>{this.props.album.name}</div>
						</div>
						<div className="meta">
							<div>{this.props.album.genre != '(255)' ? this.props.album.genre : ""}</div>
							<div>{this.props.album.year ? "Year: " + this.props.album.year : ""}</div>
							<div>Added: {moment(this.props.album.created).format("ll")}</div>
							<div>{this.props.album.songCount} tracks, {this.props.album.duration.asTime()}</div>
						</div>
						<div className="extra">
							<button className="ui small compact labelled icon green button" onClick={this.play}><i className="play icon"></i> Play</button>
							<button className="ui small compact labelled icon olive button" onClick={this.enqueue}><i className="plus icon"></i> Add to Queue</button>
							<button className="ui small compact labelled icon teal button" onClick={this.playlist}><i className="list icon"></i> Add to Playlist</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export class PlaylistQueue extends React.Component {
	state = {
		queue: null
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerEnqueued"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "playerEnqueued": this.setState({queue: event.data}); break;
		}
	}

	render() {
		if (this.state.queue == null) {
			return (
				<IconMessage icon="info circle" header="Nothing in the queue!" message="Add some tracks to the queue by browsing, or selecting a playlist." />
			);

		} else {
			return (
				<div className="ui basic segment queueView">
					<TrackList subsonic={this.props.subsonic} events={this.props.events} tracks={this.state.queue} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
}

class TrackList extends React.Component {
	state = {
		queue: [],
		playing: null
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerStarted", "playerStopped", "playerFinished", "playerEnqueued"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "playerStarted": this.setState({playing: event.data}); break;
			case "playerStopped":
			case "playerFinished": this.setState({playing: null}); break;
			case "playerEnqueued": this.setState({queue: event.data.map(function(q) {return q.id} )}); break;
		}
	}

	render() {
		var tracks = this.props.tracks.map(function (entry) {
			return (
				<Track key={entry.id} subsonic={this.props.subsonic} events={this.props.events} track={entry} iconSize={this.props.iconSize}
				 playing={this.state.playing != null && this.state.playing.id == entry.id}
				 queued={this.state.queue.indexOf(entry.id) > -1}
				 playlist={this.props.playlist} />
			);
		}.bind(this));

		return (
			<table className="ui selectable single line very basic compact table trackList">
				<thead>
					<tr>
						<th className="controls">&nbsp;</th>
						<th className="number">#</th>
						<th className="artist">Artist</th>
						<th className="title">Title</th>
						<th className="album">Album</th>
						<th className="date">Date</th>
						<th className="right aligned duration">Duration</th>
					</tr>
				</thead>
				<tbody>
					{tracks}
				</tbody>
			</table>
		);
	}
}

class Track extends React.Component {
	play() {
		this.props.events.publish({event: "playerPlay", data: this.props.track});
	}

	enqueue() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: [this.props.track]}});
	}

	render() {
		var playlistButton = this.props.playlist
			? <button className="ui mini compact icon teal button" title="Remove from playlist"><i className="minus icon"></i></button>
			: <button className="ui mini compact icon teal button" title="Add to playlist"><i className="list icon"></i></button>;

		return (
			<tr className={this.props.playing ? "positive" : ""}>
				<td>
					<button className="ui mini compact icon green button" onClick={this.play} title="Play now"><i className="play icon"></i></button>
					<button className="ui mini compact icon olive button" onClick={this.enqueue} title={this.props.queued ? "Remove from queue" : "Add to queue"}>
						<i className={this.props.queued ? "minus icon" : "plus icon"}></i>
					</button>
					{playlistButton}
				</td>
				<td>
					{this.props.track.discNumber ? (this.props.track.discNumber + '.' + this.props.track.track) : this.props.track.track}
				</td>
				<td>
					{this.props.track.artist}
				</td>
				<td>
					{this.props.track.title}
				</td>
				<td>
					{/* <CoverArt subsonic={this.props.subsonic} id={this.props.track.coverArt} size={this.props.iconSize} /> */}
					{this.props.track.album}
				</td>
				<td>
					{this.props.track.year}
				</td>
				<td className="right aligned">
					{this.props.track.duration ? this.props.track.duration.asTime() : '?:??'}
				</td>
			</tr>
		);
	}
}
