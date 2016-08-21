import React from 'react'
import Subsonic from '../subsonic'

const TEST_UNTESTED = 0;
const TEST_BUSY = 1;
const TEST_SUCCESS = 2;
const TEST_FAILED = 3;

export default class Settings extends React.Component {

	state = {
		url: this.props.subsonic.url,
		user: this.props.subsonic.user,
		password: this.props.subsonic.password,
		notifications: localStorage.getItem('notifications') === 'true',
		backgroundArt: localStorage.getItem('backgroundArt') === 'true',
		testState: TEST_UNTESTED
	}

	save(e) {
		e.preventDefault();

		localStorage.setItem('url', this.state.url);
		localStorage.setItem('username', this.state.user);
		localStorage.setItem('password', this.state.password);

		localStorage.setItem('notifications', this.state.notifications);
		localStorage.setItem('backgroundArt', this.state.backgroundArt);

		// TODO reload app with new settings
		// var subsonic = new Subsonic(
		// 	localStorage.getItem('url'),
		// 	localStorage.getItem('username'),
		// 	localStorage.getItem('password'),
		// 	this.props.subsonic.version,
		// 	this.props.subsonic.appName
		// );
		//
		// // completely replace the app node with a new one, with the new settings
		// if (React.unmountComponentAtNode(document.body)) {
		// 	React.render(
		// 		<App subsonic={subsonic} />,
		// 		document.body
		// 	);
		// }
	}

	demo(e) {
		e.preventDefault();
		if (confirm("Reconfigure to use the Subsonic demo server?")) {
			this.setState({
				url: "http://demo.subsonic.org",
				user: "guest",
				password: "guest"
			});
		}
	}

	test(e) {
		e.preventDefault();

		var subsonic = new Subsonic(
			this.state.url,
			this.state.user,
			this.state.password,
			this.props.subsonic.version,
			this.props.subsonic.appName
		);

		this.setState({testState: TEST_BUSY});

		subsonic.ping({
			success: function(data) {
				if (data.status == "ok") {
					this.setState({testState: TEST_SUCCESS});
					alert("Success!");
				} else {
					this.setState({testState: TEST_FAILED});
					alert(data.error.message);
				}
			}.bind(this),
			error: function(status, msg) {
				this.setState({testState: TEST_FAILED});
				alert("Failed to ping server");
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
			<div className="ui basic segment" id="subsonic-settings">
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
							<label>Password</label>
							<input name="password" placeholder="password" type="password" onChange={this.change} value={this.state.password} />
						</div>
					</div>

					<h3 className="ui dividing header">
						Preferences
					</h3>
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

					<div className="ui section divider"></div>

					<button className="ui blue button" type="submit">Save</button>
					<button className="ui button" onClick={this.demo}>Demo Server</button>
					<button className="ui icon button" onClick={this.test}>
						<i className={testIcon + " icon"}></i>
						Test Connection
					</button>
				</form>
			</div>
		);
	}
}
