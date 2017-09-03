import { h, Component } from 'preact';
import {IconMessage,CoverArt} from './common'
import {SecondsToTime} from '../util'

export default class TrackList extends Component {
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
		var tracks = []
		if (this.props.tracks && this.props.tracks.length > 0) {
			tracks = this.props.tracks.map(function (entry) {
				return (
					<Track key={entry.id} subsonic={this.props.subsonic} events={this.props.events} track={entry}
						playing={this.state.playing != null && this.state.playing.id == entry.id}
						queued={this.state.queue.indexOf(entry.id) > -1} playlist={this.props.playlist}
						iconSize={this.props.iconSize} />
				);
			}.bind(this));
		}

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

class Track extends Component {

	constructor(props, context) {
		super(props, context);

		this.play = this.play.bind(this);
		this.enqueue = this.enqueue.bind(this);
		this.playlistAdd = this.playlistAdd.bind(this);
		this.playlistRemove = this.playlistRemove.bind(this);
	}

	play() {
		this.props.events.publish({event: "playerPlay", data: this.props.track});
	}

	enqueue() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: [this.props.track]}});
	}

	playlistAdd() {
		this.props.events.publish({event: "playlistManage", data: {action: "ADD", tracks: [this.props.track]}});
	}

	playlistRemove() {
		this.props.events.publish({event: "playlistManage", data: {action: "REMOVE", tracks: [this.props.track], id: this.props.playlist}});
	}

	render() {
		var playlistButton;
		if (this.props.playlist) {
			playlistButton = (
				<button className="ui mini compact icon teal button" title="Remove from playlist" onClick={this.playlistRemove}>
					<i className="minus icon"></i>
				</button>
			);
		} else {
			playlistButton = (
				<button className="ui mini compact icon teal button" title="Add to playlist" onClick={this.playlistAdd}>
					<i className="list icon"></i>
				</button>
			);
		}

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
					{this.props.track.duration ? SecondsToTime(this.props.track.duration) : '?:??'}
				</td>
			</tr>
		);
	}
}
