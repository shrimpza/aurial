AudioFactory = function() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  this.context = new AudioContext();

  this.createPlayer = function(url) {
    return new AudioPlayer(this, url);
  }
}

AudioPlayer = function(factory, url) {
  this.audio = new Audio();
  this.audio.src = url;

  this.source = factory.context.createMediaElementSource(this.audio);
  this.source.connect(factory.context.destination);

  // this.gain = factory.context.createGain();
  // this.gain.connect(factory.context.destination);

  this.play = function() {
    this.audio.play();
  }
}

AudioHax = function(url) {
  this.audio = new Audio();
  this.audio.src = url;

  this.audio.addEventListener('timeupdate', function() {
    console.log(_this.audio.currentTime, _this.audio.duration);
  });

  this.play = function() {
    this.audio.play();
  }
}
