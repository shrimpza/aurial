var Player = React.createClass({
	listeners: [],
	sound: null,
	playing: null,

	getInitialState: function() {
		return {
			queue: [], 
			playing: null
		};
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
				for (var i in _this.listeners) if (_this.listeners[i].playerStart) _this.listeners[i].playerStart(track);
			},
			onpause: function() {
				for (var i in _this.listeners) if (_this.listeners[i].playerPause) _this.listeners[i].playerPause(track);
			},
			whileplaying: function() {
				for (var i in _this.listeners) if (_this.listeners[i].playerUpdate) _this.listeners[i].playerUpdate(track, this.duration, this.position);
			},
			onfinish: function() {

				// TODO onfinish not called for sound.destruct()

				for (var i in _this.listeners) if (_this.listeners[i].playerFinish) _this.listeners[i].playerFinish(track);

				if (_this.state.queue.length > 0) {
					var idx = Math.max(0, _this.state.queue.indexOf(track));

					console.log("completed " + idx);

					if (idx < _this.state.queue.length - 1)	_this.play(_this.state.queue[++idx]);

					console.log("playing next track at " + idx);
				}
			}
		});

		this.setState({playing: track});
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
	},

	addListener: function(listener) {
		this.listeners.push(listener);
	},

	removeListener: function(listener) {
		var i = this.listeners.indexOf(listener);
		if (i > -1) this.listeners.splice(i, 1);
	},

	render: function() {
		var nowPlaying = this.state.playing != null ? this.state.playing.title : "Nothing playing";
		return (
			<div className="ui basic segment player">
				<div>{nowPlaying}</div>
				<PlayerPriorButton key="prior" player={this} />
				<PlayerPlayToggleButton key="play" player={this} onClick={this.togglePlay} />
				<PlayerStopButton key="stop" player={this} onClick={this.stop} />
				<PlayerNextButton key="next" player={this} />
				<PlayerProgress key="progress" player={this} />
			</div>
		);
	}
});

var PlayerProgress = React.createClass({
	_id: UniqueID(),
	_bar: null,

	componentDidMount: function() {
		this.props.player.addListener(this);
	},

	componentWillUnmount: function() {
		this.props.player.removeListener(this);
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

var PlayerPlayToggleButton = React.createClass({
	getInitialState: function() {
		return {paused: false, playing: false, enabled: false};
	},

	componentDidMount: function() {
		this.props.player.addListener(this);
	},

	componentWillUnmount: function() {
		this.props.player.removeListener(this);
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

	render: function() {
		return (
			<button className={"ui circular icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.props.onClick}>
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
		this.props.player.addListener(this);
	},

	componentWillUnmount: function() {
		this.props.player.removeListener(this);
	},

	playerStart: function(playing) {
		this.setState({enabled: true});
	},

	playerFinish: function(playing) {
		this.setState({enabled: false});
	},

	render: function() {
		return (
			<button className={"ui circular icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.props.onClick}>
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
			<button className={"ui circular icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.props.onClick}>
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
			<button className={"ui circular icon button " + (this.state.enabled ? "" : "disabled")} onClick={this.props.onClick}>
				<i className="fast backward icon" />
			</button>
		);
	}
});
