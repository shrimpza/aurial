var CoverArt = React.createClass({
	render: function() {
		return (
			<img className="ui image" src={this.props.subsonic.getUrl("getCoverArt", {id:this.props.id, size:this.props.size})} />
		);
	}
});

var TabGroup = React.createClass({
	render: function() {
		var tabs = this.props.tabs.map(function (tab) {
			return (
				<Tab key={tab.id} id={tab.id} title={tab.title} />
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
		return (
			<a className="item" data-tab="{this.props.id}" onClick={this.props.onClick}>{this.props.title}</a>
		);
	}
});
