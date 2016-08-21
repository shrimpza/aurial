export default class AudioPlayer {

  constructor(params) {
    this.audio = new Audio();
    this.audio.src = params.url;

    this.addEvent('play', params.onPlay);
    this.addEvent('playing', params.onPlaying);
    this.addEvent('pause', params.onPause);
    this.addEvent('ended', params.onComplete);
    this.addEvent('stop', params.onStop);
    this.addProgressEvent('timeupdate', params.onProgress);
  }

  addEvent(event, callback) {
    if (callback) {
      this.audio.addEventListener(event, callback);
    }
  }

  addProgressEvent(event, callback) {
    if (callback) {
      var _this = this;
      this.audio.addEventListener(event, function() {
        callback(audio.currentTime * 1000, audio.duration * 1000);
      });
    }
  }

  play() {
    this.audio.play();
    return this;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    return this;
  }

  togglePause() {
    if (this.audio.paused) this.audio.play();
    else this.audio.pause();
    return this;
  }

  unload() {
    this.stop();
    this.audio.source = '';
    return this;
  }
}
