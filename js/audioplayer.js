AudioHax = function(params) {
    this.audio = new Audio();
    this.audio.src = params.url;

    this.addEvent = function(event, callback) {
        if (callback) {
            this.audio.addEventListener(event, callback);
        }
    }

    this.addProgressEvent = function(event, callback) {
        if (callback) {
            var _this = this;
            this.audio.addEventListener(event, function() {
                callback(_this.audio.currentTime * 1000, _this.audio.duration * 1000);
            });
        }
    }

    this.addEvent('play', params.onPlay);
    this.addEvent('playing', params.onPlaying);
    this.addEvent('pause', params.onPause);
    this.addEvent('ended', params.onComplete);
    this.addEvent('stop', params.onStop);
    this.addProgressEvent('timeupdate', params.onProgress);

    this.play = function() {
        this.audio.play();
        return this;
    }

    this.stop = function() {
        this.audio.pause();
        this.audio.currentTime = 0;
        return this;
    }

    this.togglePause = function() {
        if (this.audio.paused) this.audio.play();
        else this.audio.pause();
        return this;
    }

    this.unload = function() {
        this.stop();
        this.audio.source = '';
        return this;
    }
}
