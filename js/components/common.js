var CoverArt = React.createClass({
	render: function() {
		return (
			<img className="ui image" src={this.props.subsonic.getUrl("getCoverArt", {id:this.props.id, size:this.props.size})} />
		);
	}
});

var TabGroup = React.createClass({
	getInitialState: function() {
		return {tabs: []};
	},

	addTab: function(tab) {
		var tabs = this.state.tabs;
		tabs.push(tab);
		this.setState({tabs: tabs});
	},

	render: function() {
		var _this = this;
		var tabs = this.state.tabs.map(function (tab) {
			return (
				<Tab key={tab.id} id={tab.id} title={tab.id} />
			);
		});

		return (
			<div className="ui top attached tabular menu">
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