var Player = React.createClass({

	getDefaultProps: function() {
		return {listeners: [], sound: null};
	},

	getInitialState: function() {
		return {queue: [], playing: null};
	},

	addListener: function(listener) {
		this.props.listeners.push(listener);
	},

	removeListener: function(listener) {
		var i = this.props.listeners.indexOf(listener);
		if (i > -1) this.props.listeners.splice(i, 1);
	},

	render: function() {
		if (this.props.sound == null && this.state.playing != null) {
			console.log("play " + this.props.subsonic.getStreamUrl({id: this.state.playing.id}));
			var sound = soundManager.createSound({
				url: this.props.subsonic.getStreamUrl({id: this.state.playing.id})
			});

			var _this = this;

			sound.play({
				onplay: function() {
					for (var i in _this.props.listeners) _this.props.listeners[i].playerStart(_this.state.playing);
				},
				whileplaying: function() {
					for (var i in _this.props.listeners) _this.props.listeners[i].playerUpdate(_this.state.playing, this.duration, this.position);
				},
				onfinish: function() {
					for (var i in _this.props.listeners) _this.props.listeners[i].playerFinish(_this.state.playing);
				}
			});
		}

		var nowPlaying = this.state.playing != null ? this.state.playing.title : "Nothing playing";
		return (
			<div className="ui basic segment player">
				<div>{nowPlaying}</div>
				<PlayerProgress key="progress" player={this} />
			</div>
		);
	}
});

var PlayerProgress = React.createClass({
	_id: UniqueID(),

	componentDidMount: function() {
		this.props.player.addListener(this);
	},

	componentWillUnmount: function() {
		this.props.player.removeListener(this);
	},

	playerStart: function(playing) {
		// pass
	},

	playerFinish: function(playing) {
		// pass
	},

	playerUpdate: function(playing, length, position) {
		console.log(position + "/" + length);

		var percent = (position / length) * 100;

		$('#' + this._id + " .bar").css("width", percent + "%");
	},

	render: function() {
		return (
			<div className="ui red progress" id={this._id}>
				<div className="bar"></div>
			</div>
		);
	}
});