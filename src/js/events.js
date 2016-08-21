import {ArrayDeleteElement} from './util'

/**
* A stupidly simple publish-subscribe event bus implementation.
*/
export default class Events {
	subscribers = {};

	subscribe(sub) {
		if (!(sub.event instanceof Array)) sub.event = [event];

		for (var i = 0; i < sub.event.length; i++) {
			if (!this.subscribers[sub.event[i]]) {
				this.subscribers[sub.event[i]] = [];
			}

			if (this.subscribers[sub.event[i]].indexOf(sub.subscriber) <= -1) {
				this.subscribers[sub.event[i]].push(sub.subscriber);
			}
		}
	}

	unsubscribe(sub) {
		if (!(sub.event instanceof Array)) sub.event = [event];

		for (var i = 0; i < sub.event.length; i++) {
			if (this.subscribers[sub.event[i]]) {
				ArrayDeleteElement(this.subscribers[sub.event[i]], sub.subscriber);
			}
		}
	}

	publish(event) {
		if (this.subscribers[event.event]) {
			for (var i = 0; i < this.subscribers[event.event].length; i++) {
				this.subscribers[event.event][i].receive(event);
			}
		}
	}
}
