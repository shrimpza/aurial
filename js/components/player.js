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
		if (this.sound != null) this.sound.destruct();

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
				for (var i in _this.listeners) if (_this.listeners[i].playerFinish) _this.listeners[i].playerFinish(track);
			}
		});

		this.setState({playing: track});
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
				<PlayerPlayToggleButton key="play" player={this} />
				<PlayerStopButton key="stop" player={this}/>
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
