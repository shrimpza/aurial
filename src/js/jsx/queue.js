import React from 'react'
import moment from 'moment'
import {IconMessage} from './common'
import TrackList from './tracklist'

export default class PlayerQueue extends React.Component {
	state = {
		queue: null
	}

	constructor(props, context) {
		super(props, context);
		props.events.subscribe({
			subscriber: this,
			event: ["playerEnqueued"]
		});
	}

	receive(event) {
		switch (event.event) {
			case "playerEnqueued": this.setState({queue: event.data}); break;
		}
	}

	render() {
		if (this.state.queue == null) {
			return (
				<IconMessage icon="info circle" header="Nothing in the queue!" message="Add some tracks to the queue by browsing, or selecting a playlist." />
			);

		} else {
			return (
				<div className="ui basic segment queueView">
					<TrackList subsonic={this.props.subsonic} events={this.props.events} tracks={this.state.queue} iconSize={this.props.iconSize} />
				</div>
			);
		}
	}
}
