import {Messages} from './jsx/app'

/**
* The Player Extras class initialises a bunch of extra non-critical things.
*/
export default class PlayerExtras {
	constructor(subsonic, app, events) {
		this.scrobbler = new Scrobbler(subsonic, events);

		if (localStorage.getItem('notifications') === 'true') {
			this.notifier = new Notifier(subsonic, events);
		}

		if (localStorage.getItem('backgroundArt') === 'true') {
			this.albumBackgroundChanger = new AlbumBackgroundChanger(subsonic, events);
		}
	}

	terminate() {
		if (this.scrobler) this.scrobler.terminate();
		if (this.notifier) this.notifier.terminate();
		if (this.albumBackgroundChanger) this.albumBackgroundChanger.terminate();
	}
}

/**
* Scrobbles the currently playing track when it has played 50% or more.
*
* On submission failure, will retry.
*/
class Scrobbler {

	constructor(subsonic, events) {
		this.subsonic = subsonic;
		this.events = events;

		this.submitted = null;

		this.events.subscribe({
			subscriber: this,
			event: ["playerUpdated"]
		});
	}

	terminate() {
		this.events.unsubscribe({
			subscriber: this,
			event: ["playerUpdated"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "playerUpdated": {
				this.update(event.data.track, event.data.duration, event.data.position);
				break;
			}
		}
	}

	update(playing, length, position) {
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
						console.error("Scrobble failed for track " + playing.title, e);
						Messages.message(this.events, "Scrobble failed for track " + playing.title, "warning", "warning");
					}.bind(this)
				});
			}
		}
	}
}

/**
* Sets the page background to the currently playing track's album art.
*/
class AlbumBackgroundChanger {

	constructor(subsonic, events) {
		this.subsonic = subsonic;
		this.events = events;

		this.currentArt = 0;

		events.subscribe({
			subscriber: this,
			event: ["playerStarted"]
		});
	}

	terminate() {
		this.events.unsubscribe({
			subscriber: this,
			event: ["playerStarted"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "playerStarted": {
				if (this.currentArt != event.data.coverArt) {
					this.currentArt = event.data.coverArt;
					$('.background-layer').css('background-image', 'url(' + this.subsonic.getUrl("getCoverArt", {id: event.data.coverArt}) + ')');
				}
				break;
			}
		}
	}
}

/**
* Sets the page background to the currently playing track's album art.
*/
class Notifier {

	ICON_SIZE = 64; // small icon for notifications

	constructor(subsonic, events) {
		this.subsonic = subsonic;
		this.events = events;

		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				events.subscribe({
					subscriber: this,
					event: ["playerStarted"]
				});
			}
		}.bind(this));
	}

	terminate() {
		this.events.unsubscribe({
			subscriber: this,
			event: ["playerStarted"]
		});
	}

	receive(event) {
		// TODO only update the image if `event.data.coverArt` has changed

		switch (event.event) {
			case "playerStarted": {
				/*
				to support desktop notification daemons which don't render JPEG images
				the following hack has been put in place. it loads an image, draws it
				onto a canvas, and gets the canvas a data url in png format. the data
				url is then used for the notification icon.
				*/

				var canvas = document.createElement('canvas');
				canvas.width = this.ICON_SIZE;
				canvas.height = this.ICON_SIZE;
				var ctx = canvas.getContext('2d');

				var img = document.createElement('img');

				// we can only render to canvas and display the notification once the image has loaded
				img.onload = function() {
					ctx.drawImage(img, 0, 0);

					var notification = new Notification(event.data.title, {
						body: event.data.artist + '\n\n' + event.data.album,
						icon: canvas.toDataURL('image/png'),
						silent: true
					});
				};

				img.crossOrigin = "anonymous"; // if this isn't the most obscure thing you've ever seen, then i don't know...

				img.src = this.subsonic.getUrl("getCoverArt", {
					id: event.data.coverArt,
					size: this.ICON_SIZE
				});

				break;
			}
		}
	}
}
