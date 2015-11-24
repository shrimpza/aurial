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
				<Tab key={tab.id} id={tab.id} title={tab.title} active={tab.active} icon={tab.icon} />
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
		var icon = this.props.icon != null ? <i className={this.props.icon + " icon"}></i> : null;
		return (
			<a className={this.props.active ? "active item" : "item"} data-tab={this.props.id}>
				{icon}
				{this.props.title}
			</a>
		);
	}
});

var IconMessage = React.createClass({
	getDefaultProps: function() {
		return {type: "info", icon: "info circle"};
	},

	render: function() {
		return (
			<div className="ui basic segment">
				<div className={"ui icon message " + this.props.type}>
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