var Settings = React.createClass({
	save: function(e) {
		e.preventDefault();

		localStorage.setItem('url', $("#subsonic-settings .url").val());
		localStorage.setItem('username', $("#subsonic-settings .username").val());
		localStorage.setItem('password', $("#subsonic-settings .password").val());

		var subsonic = new Subsonic(localStorage.getItem('url'), 
									localStorage.getItem('username'), 
									localStorage.getItem('password'), 
									"1.12.0", "thing");

		this.props.app.setState({subsonic: subsonic});

		//React.render(
		//	<App subsonic={subsonic} />,
		//	document.body
		//);
	},

	render: function() {
		return (
			<div className="ui basic segment" id="subsonic-settings">
				<form className="ui form" onSubmit={this.save}>
					<div className="field">
						<label>Subsonic URL</label>
						<input className="url" placeholder="http://yourname.subsonic.com" type="text" defaultValue={this.props.subsonic.url} />
					</div>
					<div className="two fields">
						<div className="field">
							<label>Username</label>
							<input className="username" placeholder="username" type="text" defaultValue={this.props.subsonic.user} />
						</div>
						<div className="field">
							<label>Password</label>
							<input className="password" placeholder="password" type="text" defaultValue={this.props.subsonic.password} />
						</div>
					</div>
					<button className="ui button" type="submit">Save</button>
				</form>
			</div>
		);
	}
});