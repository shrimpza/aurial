AudioHax = function(params) {
  var audio = new Audio();
  audio.src = params.url;

  this.addEvent = function(event, callback) {
    if (callback) {
      audio.addEventListener(event, callback);
    }
  }

  this.addProgressEvent = function(event, callback) {
    if (callback) {
      var _this = this;
      audio.addEventListener(event, function() {
        callback(audio.currentTime * 1000, audio.duration * 1000);
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
    audio.play();
    return this;
  }

  this.stop = function() {
    audio.pause();
    audio.currentTime = 0;
    return this;
  }

  this.togglePause = function() {
    if (audio.paused) audio.play();
    else audio.pause();
    return this;
  }

  this.unload = function() {
    this.stop();
    audio.source = '';
    return this;
  }
}
