/**
* The Player Extras class initialises a bunch of extra non-critical things.
*/
PlayerExtras = function(subsonic, app, events) {

	var scrobbler = new Scrobbler(subsonic, events);

	if (localStorage.getItem('notifications') === 'true') {
		var notifier = new Notifier(subsonic, events);
	}

	if (localStorage.getItem('backgroundArt') === 'true') {
		var albumBackgroundChanger = new AlbumBackgroundChanger(subsonic, events);
	}
}

/**
* Scrobbles the currently playing track when it has played 50% or more.
*
* On submission failure, will retry.
*/
Scrobbler = function(s, e) {

	this.subsonic = s;
	this.events = e;

	this.submitted = null;

	e.subscribe({
		subscriber: this,
		event: ["playerUpdated"]
	});

	this.receive = function(event) {
		switch (event.event) {
			case "playerUpdated": {
				this.update(event.data.track, event.data.duration, event.data.position);
				break;
			}
		}
	}

	this.update = function(playing, length, position) {
		if (this.submitted != playing.id) {
			var percent = (position / length) * 100;
			if (percent > 50) {
				this.submitted = playing.id;
				this.subsonic.scrobble({
					id: playing.id,
					success: function() {
						console.log("Scrobbled track " + playing.title);
					},
					error: function(e) {
						this.submitted = null;
						console.log("Scrobble failed for track " + playing.title);
					}
				});
			}
		}
	}
}

/**
* Sets the page background to the currently playing track's album art.
*/
AlbumBackgroundChanger = function(s, e) {

	this.subsonic = s;
	this.events = e;

	this.currentArt = 0;

	e.subscribe({
		subscriber: this,
		event: ["playerStarted"]
	});

	this.receive = function(event) {
		switch (event.event) {
			case "playerStarted": {
				if (this.currentArt != event.data.coverArt) {
					this.currentArt = event.data.coverArt;
					$('#background-layer').css('background-image', 'url(' + this.subsonic.getUrl("getCoverArt", {id: event.data.coverArt}) + ')');
				}
				break;
			}
		}
	}
}

/**
* Sets the page background to the currently playing track's album art.
*/
Notifier = function(s, e) {

	this.subsonic = s;
	this.events = e;

	var _this = this;
	Notification.requestPermission(function (permission) {
		if (permission === "granted") {
			e.subscribe({
				subscriber: _this,
				event: ["playerStarted"]
			});
		}
	});

	this.receive = function(event) {
		switch (event.event) {
			case "playerStarted": {
				var notification = new Notification(event.data.title, {
					body: event.data.artist + '\n\n' + event.data.album,
					icon: this.subsonic.getUrl("getCoverArt", {
						id: event.data.coverArt,
						size: 48 // small icon for notifications
					}),
					silent: true
				});
				break;
			}
		}
	}
}
