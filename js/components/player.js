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

	addListener: function(listener) {
		this.listeners.push(listener);
	},

	removeListener: function(listener) {
		var i = this.listeners.indexOf(listener);
		if (i > -1) this.listeners.splice(i, 1);
	},

	render: function() {
		if (this.sound == null && this.state.playing != null) {
			var _this = this;
			var streamUrl = this.props.subsonic.getStreamUrl({id: this.state.playing.id});

			this.sound = soundManager.createSound({
				url: streamUrl
			}).play({
				onplay: function() {
					for (var i in _this.listeners) _this.listeners[i].playerStart(_this.state.playing);
				},
				whileplaying: function() {
					for (var i in _this.listeners) _this.listeners[i].playerUpdate(_this.state.playing, this.duration, this.position);
				},
				onfinish: function() {
					for (var i in _this.listeners) _this.listeners[i].playerFinish(_this.state.playing);
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