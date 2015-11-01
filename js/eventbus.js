/**
 * A stupidly simple publish-subscribe event bus implementation.
 */
EventBus = function() {
	this._subscribers = {};

	this.subscribe = function(sub) {
		if (!$.isArray(sub.event)) sub.event = [event];

		for (var i = 0; i < sub.event.length; i++) {
			if (!this._subscribers[sub.event[i]]) {
				this._subscribers[sub.event[i]] = [];
			}

			if (this._subscribers[sub.event[i]].indexOf(sub.subscriber) <= -1) {
				this._subscribers[sub.event[i]].push(sub.subscriber);
			}
		}
	}

	this.unsubscribe = function(sub) {
		if (!$.isArray(sub.event)) sub.event = [event];

		for (var i = 0; i < sub.event.length; i++) {
			if (this._subscribers[sub.event[i]]) {
				this._subscribers[sub.event[i]].delete(sub.subscriber);
			}
		}
	}

	this.publish = function(event) {
		if (this._subscribers[event.event]) {
			for (var i = 0; i < this._subscribers[event.event].length; i++) {
				this._subscribers[event.event][i].receive(event);
			}
		}
	}
};
