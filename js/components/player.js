var Player = React.createClass({
	noImage: 'data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

	sound: null,
	playing: null,
	shuffle: false,

	getInitialState: function() {
		return {
			queue: [], 
			playing: null
		};
	},

	componentDidMount: function() {
		this.props.events.subscribe({
			subscriber: this,
			event: ["playerPlay", "playerToggle", "playerStop", "playerEnqueue", "playerShuffle"]
		});
	},

	play: function(track) {
		if (this.state.queue.indexOf(track) < 0) this.enqueue([track]);

		this.stop();

		var _this = this;
		var streamUrl = this.props.subsonic.getStreamUrl({id: track.id});

		this.sound = soundManager.createSound({
			url: streamUrl
		}).play({
			onplay: function() {
				_this.props.events.publish({event: "playerStarted", data: track});
			},
			onresume: function() {
				_this.props.events.publish({event: "playerStarted", data: track});
			},
			onstop: function() {
				_this.props.events.publish({event: "playerStopped", data: track});
			},
			onpause: function() {
				_this.props.events.publish({event: "playerPaused", data: track});
			},
			whileplaying: function() {
				_this.props.events.publish({event: "playerUpdated", data: {track: track, duration: this.duration, position: this.position}});
			},
			onfinish: function() {
				// TODO onfinish not called for sound.destruct()
				_this.props.events.publish({event: "playerFinished", data: track});
		
				_this.next();
			}
		});

		this.setState({playing: track});
	},

	next: function() {
		if (this.state.queue.length > 0) {
			if (this.shuffle) {
				var idx = Math.round(Math.random() * (this.state.queue.length));
				this.play(this.state.queue[idx]);
				console.log("playing random track " + idx);
			} else {
				var idx = Math.max(0, this.state.queue.indexOf(this.state.playing));
				if (idx < this.state.queue.length - 1) this.play(this.state.queue[++idx]);
				console.log("playing next track at " + idx);
			}
		}
	},

	receive: function(event) {
		switch (event.event) {
			case "playerPlay": this.play(event.data); break;
			case "playerToggle": this.togglePlay(); break;
			case "playerStop": this.stop(); break;
			case "playerEnqueue": this.enqueue(event.data); break;
			case "playerShuffle": this.shuffle = event.data; break;
		}
	},

	togglePlay: function() {
		if (this.sound != null) {
			console.log("togglePlay: toggle");
			this.sound.togglePause();
		} else if (this.playing != null) {
			console.log("togglePlay: restart");
			this.play(this.playing);
		} else if (this.state.queue.length > 0) {
			console.log("togglePlay: start queue");
			this.play(this.state.queue[0]);
		}
	},

	stop: function() {
		if (this.sound != null) this.sound.destruct();
		this.sound = null;
	},

	enqueue: function(tracks) {
		var queue = this.state.queue;
		for (var i = 0; i < tracks.length; i++) queue.push(tracks[i]);

		console.log("queue", queue);

		this.setState({queue: queue});

		this.props.events.publish({event: "playerEnqueued", data: queue});
	},

	render: function() {
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
								<table>
									<tr>
										<td className="controls">
											<div className="ui compact icon buttons">
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
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var PlayerPlayingTitle = React.createClass({
	render: function() {
		return (
			<span>
				{this.props.playing == null ? "Nothing playing" : this.props.playing.title}
			</span>
		);
	}
});

var PlayerPlayingInfo = React.createClass({
	render: function() {
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
});

var PlayerProgress = React.createClass({
	_id: UniqueID(),
	_bar: null,

	componentDidMount: function() {
		this.props.events.subscribe({
			subscriber: this,
			event: ["playerUpdated"]
		});
	},

	componentWillUnmount: function() {
	},

	receive: function(event) {
		switch (event.event) {
			case "playerUpdated": 
				this.playerUpdate(event.data.track, event.data.duration, event.data.position);
				break;
		}
	},

	playerUpdate: function(playing, length, position) {
		if (this._bar == null) this._bar = $('#' + this._id + " .bar");

		var percent = (position / length) * 100;
		this._bar.css("width", percent + "%");
	},

	render: function() {
		return (
			<div className="ui red progress" id={this._id}>
				<div className="bar"></div>
			</div>
		);
	}
});

var PlayerPositionDisplay = React.createClass({
	getInitialState: function() {
		return {duration: 0, position: 0};
	},

	componentDidMount: function() {
		this.props.events.subscribe({
			subscriber: this,
			event: ["playerUpdated"]
		});
	},

	componentWillUnmount: function() {
	},

	receive: function(event) {
		switch (event.event) {
			case "playerUpdated": 
				this.setState({duration: event.data.duration, position: event.data.position});
				break;
		}
	},

	render: function() {
		return (
			<div className="ui label">
				<i className="clock icon"></i>
				{(this.state.position / 1000).asTime()}/{(this.state.duration / 1000).asTime()}
			</div>
		);
	}
});

var PlayerPlayToggleButton = React.createClass({
	getInitialState: function() {
		return {paused: false, playing: false, enabled: false};
	},

	componentDidMount: function() {
		this.props.events.subscribe({
			subscriber: this,
			event: ["playerStarted", "playerStopped", "playerFinished", "playerPaused", "playerEnqueued"]
		});
	},

	componentWillUnmount: function() {
	},

	receive: function(event) {
		switch (event.event) {
			case "playerStarted": this.playerStart(event.data); break;
			case "playerStopped": 
			case "playerFinished": this.playerFinish(event.data); break;
			case "playerPaused": this.playerPause(event.data); break;
			case "playerEnqueued": this.playerEnqueue(event.data); break;
		}
	},

	playerStart: function(playing) {
		this.setState({paused: false, playing: true, enabled: true});
	},

	playerFinish: function(playing) {
		this.setState({paused: false, playing: false});
	},

	playerPause: function(playing) {
		this.setState({paused: true});
	},

	playerEnqueue: function(queue) {
		this.setState({enabled: queue.length > 0});
	},

	onClick: function() {
		this.props.events.publish({event: "playerToggle"});
	},

	render: function() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className={this.state.paused || !this.state.playing ? "play icon" : "pause icon"} />
			</button>
		);
	}
});

var PlayerStopButton = React.createClass({
	getInitialState: function() {
		return {enabled: false};
	},

	componentDidMount: function() {
		this.props.events.subscribe({
			subscriber: this,
			event: ["playerStarted", "playerStopped", "playerFinished"]
		});
	},

	componentWillUnmount: function() {
	},

	receive: function(event) {
		switch (event.event) {
			case "playerStarted": this.playerStart(event.data); break;
			case "playerStopped": 
			case "playerFinished": this.playerFinish(event.data); break;
		}
	},

	playerStart: function(playing) {
		this.setState({enabled: true});
	},

	playerFinish: function(playing) {
		this.setState({enabled: false});
	},

	onClick: function() {
		this.props.events.publish({event: "playerStop"});
	},

	render: function() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className="stop icon" />
			</button>
		);
	}
});

var PlayerNextButton = React.createClass({
	getInitialState: function() {
		return {enabled: false};
	},

	render: function() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className="fast forward icon" />
			</button>
		);
	}
});

var PlayerPriorButton = React.createClass({
	getInitialState: function() {
		return {enabled: false};
	},

	render: function() {
		return (
			<button className={"ui icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.onClick}>
				<i className="fast backward icon" />
			</button>
		);
	}
});

var PlayerShuffleButton = React.createClass({
	getInitialState: function() {
		return {shuffle: false};
	},

	onClick: function() {
		var shuffle = !this.state.shuffle;
		this.setState({shuffle: shuffle});
		this.props.events.publish({event: "playerShuffle", data: shuffle});
	},

	render: function() {
		return (
			<button className="ui icon button" onClick={this.onClick}>
				<i className={"random icon " + (this.state.shuffle ? "red" : "")} />
			</button>
		);
	}
});
