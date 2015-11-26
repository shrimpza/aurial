var Settings = React.createClass({
	getInitialState: function() {
		return {
			url: this.props.subsonic.url,
			user: this.props.subsonic.user,
			password: this.props.subsonic.password
		};
	},

	save: function(e) {
		e.preventDefault();

		localStorage.setItem('url', this.state.url);
		localStorage.setItem('username', this.state.user);
		localStorage.setItem('password', this.state.password);

		var subsonic = new Subsonic(localStorage.getItem('url'), 
									localStorage.getItem('username'), 
									localStorage.getItem('password'), 
									"1.12.0", "thing");

		// completely replace the app node with a new one, with the new settings
		if (React.unmountComponentAtNode(document.body)) {
			React.render(
				<App subsonic={subsonic} />,
				document.body
			);
		}
	},

	demo: function(e) {
		e.preventDefault();
		if (confirm("Reconfigure to use the Subsonic demo server?")) {
			this.setState({
				url: "http://demo.subsonic.org",
				user: "guest",
				password: "guest"
			});
		}
	},

	change: function(e) {
		switch (e.target.name) {
			case "url": 
				this.setState({url: e.target.value});
				break;
			case "user": 
				this.setState({user: e.target.value});
				break;
			case "password": 
				this.setState({password: e.target.value});
				break;
		}
	},

	render: function() {
		return (
			<div className="ui basic segment" id="subsonic-settings">
				<form className="ui form" onSubmit={this.save}>
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
					<button className="ui green button" type="submit">Save</button>
					<button className="ui button" onClick={this.demo}>Demo</button>
				</form>
			</div>
		);
	}
});