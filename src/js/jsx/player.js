import React from 'react'
import AudioPlayer from '../audioplayer'
import {UniqueID,SecondsToTime,ArrayShuffle} from '../util'
import {CoverArt} from './common'

export default class Player extends React.Component {
	noImage = 'data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

	sound = null;
	playing = null;
	queue = []; // the queue we use internally for jumping between tracks, shuffling, etc

	state = {
		queue: [], // the input queue
		shuffle: false,
		playing: null
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerPlay", "playerToggle", "playerStop", "playerNext", "playerPrevious", "playerEnqueue", "playerShuffle"]
		});
	}

	componentWillUpdate(nextProps, nextState) {
		if (this.queueDiff(this.queue, nextState.queue) || this.state.shuffle != nextState.shuffle) {
			this.queue = (this.state.shuffle || nextState.shuffle) ? ArrayShuffle(nextState.queue.slice()) : nextState.queue.slice();
		}
	}

	receive(event) {
		switch (event.event) {
			case "playerPlay": this.play(event.data); break;
			case "playerToggle": this.togglePlay(); break;
			case "playerStop": this.stop(); break;
			case "playerNext": this.next(); break;
			case "playerPrevious": this.previous(); break;
			case "playerEnqueue": this.enqueue(event.data.action, event.data.tracks); break;
			case "playerShuffle": this.setState({shuffle: event.data}); break;
		}
	}

	play(track) {
		this.stop();

		var streamUrl = this.props.subsonic.getStreamUrl({id: track.id});

		var events = this.props.events;

		this.sound = new AudioPlayer({
			url: streamUrl,
			onPlay: function() {
				events.publish({event: "playerStarted", data: track});
			},
			onResume: function() {
				events.publish({event: "playerStarted", data: track});
			},
			onStop: function() {
				events.publish({event: "playerStopped", data: track});
			},
			onPause: function() {
				events.publish({event: "playerPaused", data: track});
			},
			onProgress: function(position, duration) {
				events.publish({event: "playerUpdated", data: {track: track, duration: duration, position: position}});
			},
			onLoading: function(loaded, total) {
				events.publish({event: "playerLoading", data: {track: track, loaded: loaded, total: total}});
			},
			onComplete: function() {
				events.publish({event: "playerFinished", data: track});
				this.next();
			}.bind(this)
		}).play();

		this.setState({playing: track});
	}

	next() {
		this.stop();

		if (this.queue.length > 0) {
			var idx = this.state.playing == null ? 0 : Math.max(0, this.queue.indexOf(this.state.playing));

			if (idx < this.queue.length - 1) idx++;
			else idx = 0;

			this.play(this.queue[idx]);
		}
	}

	previous() {
		this.stop();

		if (this.queue.length > 0) {
			var idx = this.state.playing == null ? 0 : Math.max(0, this.queue.indexOf(this.state.playing));

			if (idx > 0) idx--;
			else idx = this.queue.length - 1;

			this.play(this.queue[idx]);
		}
	}

	togglePlay() {
		if (this.sound != null) {
			this.sound.togglePause();
		} else if (this.playing != null) {
			this.play(this.playing);
		} else if (this.queue.length > 0) {
			this.play(this.queue[0]);
		}
	}

	stop() {
		if (this.sound != null) {
			this.sound.stop();
			this.sound.unload();
		}
		this.sound = null;
	}

	enqueue(action, tracks) {
		var queue = this.state.queue.slice();
		var trackIds = queue.map(function(t) {
			return t.id;
		});

		switch (action) {
			case "REPLACE": queue = tracks.slice(); break;
			case "ADD":
			default: {
				for (var i = 0; i < tracks.length; i++) {
					var idx = trackIds.indexOf(tracks[i].id);
					if (idx == -1) {
						queue.push(tracks[i]);
						trackIds.push(tracks[i].id);
					} else {
						queue.splice(idx, 1);
						trackIds.splice(idx, 1);
					}
				}
				break;
			}
		}

		this.setState({queue: queue});

		this.props.events.publish({event: "playerEnqueued", data: queue});
	}

	queueDiff(q1, q2) {
		if (q1.length != q2.length) return true;

		var diff = true;

		q1.forEach(function(t1) {
			var found = false;
			for (const t2 of q2) {
				if (t1.id == t2.id) {
					found = true;
					break;
				}
			}
			diff = diff && !found;
		});

		return diff;
	}

	render() {
		var nowPlaying = "Nothing playing";
		var coverArt = <img src={this.noImage} />;

		if (this.state.playing != null) {
			coverArt = <CoverArt subsonic={this.props.subsonic} id={this.state.playing.coverArt} size={80} />;
		}

		return (
			<div className="ui basic segment player">
				<div className="ui items">
					<div className="ui item">
						<div className="ui tiny image">
							{coverArt}
						</div>
						<div className="content">
							<div className="header">
								<PlayerPlayingTitle events={this.props.events} playing={this.state.playing} />
							</div>
							<div className="meta">
								<PlayerPlayingInfo events={this.props.events} playing={this.state.playing} />
							</div>
							<div className="description">
								<table><tbody>
									<tr>
										<td className="controls">
											<div className="ui black icon buttons">
												<PlayerPriorButton key="prior" events={this.props.events} />
												<PlayerPlayToggleButton key="play" events={this.props.events} />
												<PlayerStopButton key="stop" events={this.props.events} />
												<PlayerNextButton key="next" events={this.props.events} />
												<PlayerShuffleButton key="shuffle" events={this.props.events} />
												<PlayerPositionDisplay key="time" events={this.props.events} />
											</div>
										</td>
										<td className="progress">
											<PlayerProgress key="progress" events={this.props.events} />
										</td>
									</tr>
								</tbody></table>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

class PlayerPlayingTitle extends React.Component {
	render() {
		return (
			<span>
				{this.props.playing == null ? "Nothing playing" : this.props.playing.title}
			</span>
		);
	}
}

class PlayerPlayingInfo extends React.Component {
	render() {
		var album = "Nothing playing";
		if (this.props.playing != null) {
			album = this.props.playing.artist + " - " + this.props.playing.album;
			if (this.props.playing.date) album += " (" + this.props.playing.date + ")";
		}

		return (
			<span>
				{album}
			</span>
		);
	}
}

class PlayerProgress extends React.Component {
	state = {
		playerProgress: 0,
		loadingProgress: 0
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerUpdated", "playerLoading"]
		});
	}

	componentWillUnmount() {
	}

	receive(event) {
		switch (event.event) {
			case "playerUpdated": this.playerUpdate(event.data.track, event.data.duration, event.data.position); break;
			case "playerLoading": this.playerLoading(event.data.track, event.data.loaded, event.data.total); break;
		}
	}

	playerUpdate(playing, length, position) {
		var percent = (position / length) * 100;
		this.setState({playerProgress: percent});
	}

	playerLoading(playing, loaded, total) {
		var percent = (loaded / total) * 100;
		this.setState({loadingProgress: percent});
	}

	render() {
		var playerProgress = {width: this.state.playerProgress + "%"};
		var loadingProgress = {width: this.state.loadingProgress + "%"};
		return (
			<div>
				<div className="ui red progress">
					<div className="track bar" style={playerProgress}></div>
					<div className="loading bar" style={loadingProgress}></div>
				</div>
			</div>
		);
	}
}

class PlayerPositionDisplay extends React.Component {
	state = {
		duration: 0,
		position: 0
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerUpdated"]
		});
	}

	componentWillUnmount() {
	}

	receive(event) {
		switch (event.event) {
			case "playerUpdated": this.setState({duration: event.data.duration, position: event.data.position}); break;
		}
	}

	render() {
		return (
			<div className="ui disabled labeled icon button">
				<i className="clock icon"></i>
				{SecondsToTime(this.state.position / 1000)}/{SecondsToTime(this.state.duration / 1000)}
			</div>
		);
	}
}

class PlayerPlayToggleButton extends React.Component {
	state = {
		paused: false,
		playing: false,
		enabled: false
	}

	constructor(props, context) {
		super(props, context);

		this.onClick = this.onClick.bind(this);

		props.events.subscribe({
			subscriber: this,
			event: ["playerStarted", "playerStopped", "playerFinished", "playerPaused", "playerEnqueued"]
		});
	}

	componentWillUnmount() {
	}

	receive(event) {
		switch (event.event) {
			case "playerStarted": this.playerStart(event.data); break;
			case "playerStopped":
			case "playerFinished": this.playerFinish(event.data); break;
			case "playerPaused": this.playerPause(event.data); break;
			case "playerEnqueued": this.playerEnqueue(event.data); break;
		}
	}

	playerStart(playing) {
		this.setState({paused: false, playing: true, enabled: true});
	}

	playerFinish(playing) {
		this.setState({paused: false, playing: false});
	}

	playerPause(playing) {
		this.setState({paused: true});
	}

	playerEnqueue(queue) {
		this.setState({enabled: queue.length > 0});
	}

	onClick() {
		this.props.events.publish({event: "playerToggle"});
	}

	render() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className={this.state.paused || !this.state.playing ? "play icon" : "pause icon"} />
			</button>
		);
	}
}

class PlayerStopButton extends React.Component {
	state = {
		enabled: false
	}

	constructor(props, context) {
		super(props, context);

		this.onClick = this.onClick.bind(this);

		props.events.subscribe({
			subscriber: this,
			event: ["playerStarted", "playerStopped", "playerFinished"]
		});
	}

	componentWillUnmount() {
	}

	receive(event) {
		switch (event.event) {
			case "playerStarted": this.playerStart(event.data); break;
			case "playerStopped":
			case "playerFinished": this.playerFinish(event.data); break;
		}
	}

	playerStart(playing) {
		this.setState({enabled: true});
	}

	playerFinish(playing) {
		this.setState({enabled: false});
	}

	onClick() {
		this.props.events.publish({event: "playerStop"});
	}

	render() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className="stop icon" />
			</button>
		);
	}
}

class PlayerNextButton extends React.Component {
	state = {
		enabled: false
	}

	constructor(props, context) {
		super(props, context);

		this.onClick = this.onClick.bind(this);

		props.events.subscribe({
			subscriber: this,
			event: ["playerEnqueued"]
		});
	}

	componentWillUnmount() {
	}

	receive(event) {
		switch (event.event) {
			case "playerEnqueued": this.setState({enabled: event.data.length > 0}); break;
		}
	}

	onClick() {
		this.props.events.publish({event: "playerNext"});
	}

	render() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className="fast forward icon" />
			</button>
		);
	}
}

class PlayerPriorButton extends React.Component {
	state = {
		enabled: false
	}

	constructor(props, context) {
		super(props, context);

		this.onClick = this.onClick.bind(this);

		props.events.subscribe({
			subscriber: this,
			event: ["playerEnqueued"]
		});
	}

	componentWillUnmount() {
	}

	receive(event) {
		switch (event.event) {
			case "playerEnqueued": this.setState({enabled: event.data.length > 0}); break;
		}
	}

	onClick() {
		this.props.events.publish({event: "playerPrevious"});
	}

	render() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className="fast backward icon" />
			</button>
		);
	}
}

class PlayerShuffleButton extends React.Component {
	state = {
		shuffle: false
	}

	constructor(props, context) {
		super(props, context);

		this.onClick = this.onClick.bind(this);
	}

	onClick() {
		var shuffle = !this.state.shuffle;
		this.setState({shuffle: shuffle});
		this.props.events.publish({event: "playerShuffle", data: shuffle});
	}

	render() {
		return (
			<button className="ui icon button" onClick={this.onClick}>
				<i className={"random icon " + (this.state.shuffle ? "red" : "")} />
			</button>
		);
	}
}
