var CoverArt = React.createClass({
	render: function() {
		return (
			<img className="ui image" src={this.props.subsonic.getUrl("getCoverArt", {id:this.props.id, size:this.props.size})} />
		);
	}
});

var TabGroup = React.createClass({
	componentDidMount: function() {
		$('.menu .item').tab();
	},

	render: function() {
		var tabs = this.props.tabs.map(function (tab) {
			return (
				<Tab key={tab.id} id={tab.id} title={tab.title} active={tab.active} />
			);
		});

		return (
			<div className="ui secondary pointing menu">
				{tabs}
			</div>
		);
	}
});

var Tab = React.createClass({
	render: function() {
		var className = this.props.active ? "active item" : "item";
		return (
			<a className={className} data-tab={this.props.id}>{this.props.title}</a>
		);
	}
});

var IconMessage = React.createClass({
	render: function() {
		return (
			<div className="ui basic segment">
				<div className="ui icon message">
					<i className={this.props.icon + " icon"}></i>
					<div className="content">
						<div className="header">{this.props.header}</div>
						<p>{this.props.message}</p>
					</div>
				</div>
			</div>
		);
	}
});