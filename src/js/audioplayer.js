export default class AudioPlayer {

	constructor(params) {
		this.audio = new Audio();
		if (params.volume) this.audio.volume = params.volume;

		// set up events
		this.addEvent('play', params.onPlay);
		this.addEvent('playing', params.onPlaying);
		this.addEvent('pause', params.onPause);
		this.addEvent('ended', params.onComplete);
		this.addLoadingEvent('progress', params.onLoading);
		this.addProgressEvent('timeupdate', params.onProgress);

		// events and everything else configured, set the src to begin loading
		this.audio.src = params.url;

		this.stopEvent = params.onStop;
	}

	addEvent(event, callback) {
		if (callback) {
			this.audio.addEventListener(event, callback);
		}
	}

	addProgressEvent(event, callback) {
		if (callback) {
			this.audio.addEventListener(event, function() {
				callback(this.audio.currentTime * 1000, this.audio.duration * 1000);
			}.bind(this));
		}
	}

	addLoadingEvent(event, callback) {
		if (callback) {
			this.audio.addEventListener(event, function() {
				callback((this.audio.buffered.length > 0 ? this.audio.buffered.end(0) : 0) * 1000, this.audio.duration * 1000);
			}.bind(this));
		}
	}

	play() {
		this.audio.play();
		return this;
	}

	stop() {
		this.audio.pause();
		this.audio.currentTime = 0;
		// also, generate a synthetic "stop" event
		if (this.stopEvent) this.stopEvent();
		return this;
	}

	togglePause() {
		if (this.audio.paused) this.audio.play();
		else this.audio.pause();
		return this;
	}

	volume(volume) {
		this.audio.volume = volume;
		return this;
	}

	unload() {
		this.stop();
		this.audio.src = '';
		this.audio.load();
		return this;
	}
}
