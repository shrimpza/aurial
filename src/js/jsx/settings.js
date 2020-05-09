import { h, Component } from 'preact';
import Subsonic from '../subsonic'
import {UniqueID} from '../util'
import {Messages} from './app'
import {Prompt} from './common'

const TEST_UNTESTED = 0;
const TEST_BUSY = 1;
const TEST_SUCCESS = 2;
const TEST_FAILED = 3;

export default class Settings extends Component {

	state = {
		url: this.props.subsonic.url,
		user: this.props.subsonic.user,
		password: '',
		notifications: localStorage.getItem('notifications') === 'true',
		backgroundArt: localStorage.getItem('backgroundArt') === 'true',
		persistQueue: localStorage.getItem('persistQueue') === 'true',
		repeatQueue: localStorage.getItem('repeatQueue') === 'true',
		trackBuffer: localStorage.getItem('trackBuffer') || '0',
		testState: TEST_UNTESTED
	};

	constructor(props, context) {
		super(props, context);

		this.save = this.save.bind(this);
		this.change = this.change.bind(this);
		this.demo = this.demo.bind(this);
		this.test = this.test.bind(this);
	}

	save(e) {
		e.preventDefault();

		localStorage.setItem('url', this.state.url);
		localStorage.setItem('username', this.state.user);

		if (this.state.password !== '') {
			var salt = UniqueID();
			localStorage.setItem('token', Subsonic.createToken(this.state.password, salt));
			localStorage.setItem('salt', salt);
		}

		localStorage.setItem('notifications', this.state.notifications);
		localStorage.setItem('backgroundArt', this.state.backgroundArt);
		localStorage.setItem('persistQueue', this.state.persistQueue);
		localStorage.setItem('repeatQueue', this.state.repeatQueue);
		localStorage.setItem('trackBuffer', this.state.trackBuffer);

		Messages.message(this.props.events, "Settings saved.", "success", "Save");

		// reload app with new settings
		var subsonic = new Subsonic(
			localStorage.getItem('url'),
			localStorage.getItem('username'),
			localStorage.getItem('token'),
			localStorage.getItem('salt'),
			this.props.subsonic.version,
			this.props.subsonic.appName
		);

		// publish new settings to negate need to reload the page - App consumes these
		this.props.events.publish({event: "appSettings",
			data: {
				subsonic: subsonic,
				trackBuffer: localStorage.getItem('trackBuffer')
			}
		});
	}

	demo(e) {
		e.preventDefault();
		this.demoPrompt.show(function(approve) {
			if (!approve) return;

			this.setState({
				url: "http://demo.subsonic.org",
				user: "guest5",
				password: "guest"
			});

		}.bind(this));
	}

	test(e) {
		e.preventDefault();

		var salt = UniqueID();

		var subsonic = new Subsonic(
			this.state.url,
			this.state.user,
			Subsonic.createToken(this.state.password, salt),
			salt,
			this.props.subsonic.version,
			this.props.subsonic.appName
		);

		this.setState({testState: TEST_BUSY});

		subsonic.ping({
			success: function(data) {
				if (data.status === "ok") {
					this.setState({testState: TEST_SUCCESS});
					Messages.message(this.props.events, "Connection test successful!", "success", "plug");
				} else {
					console.log(data.error);
					this.setState({testState: TEST_FAILED});
					Messages.message(this.props.events, data.error.message, "error", "plug");
				}
			}.bind(this),
			error: function(err) {
				this.setState({testState: TEST_FAILED});
				Messages.message(this.props.events, "Failed to connect to server: " + err.message, "error", "plug");
			}.bind(this)
		});
	}

	change(e) {
		switch (e.target.name) {
			case "url": this.setState({url: e.target.value}); break;
			case "user": this.setState({user: e.target.value}); break;
			case "password": this.setState({password: e.target.value}); break;
			case "notifications": this.setState({notifications: e.target.checked}); break;
			case "backgroundArt": this.setState({backgroundArt: e.target.checked}); break;
			case "persistQueue": this.setState({persistQueue: e.target.checked}); break;
			case "repeatQueue": this.setState({repeatQueue: e.target.checked}); break;
			case "trackBuffer": this.setState({trackBuffer: e.target.value}); break;
		}

		this.setState({testState: TEST_UNTESTED});
	}

	render() {
		var testIcon = "circle thin";
		switch (this.state.testState) {
			case TEST_BUSY: testIcon = "loading spinner"; break;
			case TEST_SUCCESS: testIcon = "green checkmark"; break;
			case TEST_FAILED: testIcon = "red warning sign"; break;
			default: testIcon = "circle thin";
		}

		return (
			<div className="ui basic segment">
				<form className="ui form" onSubmit={this.save}>
					<h3 className="ui dividing header">
						Subsonic Connection
					</h3>
					<div className="field">
						<label>Subsonic URL</label>
						<input name="url" placeholder="http://yourname.subsonic.com" type="text" onChange={this.change} value={this.state.url} />
					</div>
					<div className="two fields">
						<div className="field">
							<label>Username</label>
							<input name="user" placeholder="username" type="text" onChange={this.change} value={this.state.user} />
						</div>
						<div className="field">
							<label>Password (<i>leave blank to keep unchanged</i>)</label>
							<input name="password" placeholder="password" type="password" onChange={this.change} value={this.state.password} />
						</div>
					</div>

					<h3 className="ui dividing header">
						Preferences
					</h3>
					<div className="field">
						<label>Buffer next track (begin buffering this long before end of the current track)</label>
						<select name="trackBuffer" onChange={this.change} value={this.state.trackBuffer}>
							<option value="0">Disabled</option>
							<option value="10">10 seconds</option>
							<option value="30">30 seconds</option>
						</select>
					</div>
					<div className="field">
						<div className="ui checkbox">
							<input name="notifications" type="checkbox" onChange={this.change} checked={this.state.notifications}/>
							<label>Enable desktop notifications</label>
						</div>
					</div>
					<div className="field">
						<div className="ui checkbox">
							<input name="backgroundArt" type="checkbox" onChange={this.change} checked={this.state.backgroundArt}/>
							<label>Enable background art</label>
						</div>
					</div>
					<div className="field">
						<div className="ui checkbox">
							<input name="persistQueue" type="checkbox" onChange={this.change} checked={this.state.persistQueue}/>
							<label>Save queue (your queue will be restored after browser restarts, page reloads, etc)</label>
						</div>
					</div>
					<div className="field">
						<div className="ui checkbox">
							<input name="repeatQueue" type="checkbox" onChange={this.change} checked={this.state.repeatQueue}/>
							<label>Repeat queue (restart playing once the end of the queue has been reached)</label>
						</div>
					</div>

					<div className="ui section divider"></div>

					<button className="ui blue button" type="submit">Save</button>
					<button className="ui button" onClick={this.demo}>Demo Server</button>
					<button className="ui icon button" onClick={this.test}>
						<i className={testIcon + " icon"}></i>
						Test Connection
					</button>
				</form>

				<Prompt ref={(r) => {this.demoPrompt = r;} } title="Use Demo Server"
					message="Reconfigure to use the Subsonic demo server? Please see http://www.subsonic.org/pages/demo.jsp for more information."
					ok="Yes" cancel="No" icon="red question" />
			</div>
		);
	}
}
