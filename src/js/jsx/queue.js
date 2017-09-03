import { h, Component } from 'preact';
import moment from 'moment'
import {IconMessage} from './common'
import TrackList from './tracklist'
import {SecondsToTime} from '../util'

export default class PlayerQueue extends Component {
	state = {
		queue: null
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerEnqueued"]
		});

		this.clear = this.clear.bind(this);
		this.playlist = this.playlist.bind(this);
	}

	receive(event) {
		switch (event.event) {
			case "playerEnqueued": this.setState({queue: event.data}); break;
		}
	}

	clear() {
		this.props.events.publish({event: "playerEnqueue", data: {action: "ADD", tracks: this.state.queue}});
	}

	playlist() {
		this.props.events.publish({event: "playlistManage", data: {action: "ADD", tracks: this.state.queue}});
	}

	render() {
		if (this.state.queue == null) {
			return (
				<IconMessage icon="info circle" header="Nothing in the queue!" message="Add some tracks to the queue by browsing, or selecting a playlist." />
			);

		} else {
			var length = this.state.queue.reduce(function(total, track) {
				return total + track.duration;
			}, 0);

			return (
				<div className="ui basic segment queueView">
					<div className="ui items">
						<div className="item">
							<div className="aligned content">
								<p className="header">
									<i className="grey play icon"></i>
									{this.state.queue.length} tracks, {SecondsToTime(length)}</p>
								<div className="extra">
									<button className="ui small compact labelled icon teal button" onClick={this.playlist}><i className="list icon"></i> Add to Playlist</button>
									<button className="ui small compact labelled icon red button" onClick={this.clear}><i className="trash icon"></i> Clear Queue</button>
								</div>
							</div>
						</div>
					</div>
					<TrackList subsonic={this.props.subsonic} events={this.props.events} tracks={this.state.queue} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
}
