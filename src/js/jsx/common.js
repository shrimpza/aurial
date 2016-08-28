import React from 'react'

export class Tabs extends React.Component {
	static defaultProps = {
		tabs: []
	}

	constructor(props, context) {
		super(props, context);

		this.activeTab = this.props.tabs[0];
	}

	render() {
		<div>
			
		</div>
	}
}

export class SimpleTab = {
	static defaultProps = {
		icon: null
	}

	state = {
		active: false
	}

	constructor(props, context) {
		super(props, context);

		this.setActive = this.setActive.bind(this);
	}

	setActive(active) {
		this.setState({active: active});
	}

	render() {
		var icon = this.props.icon != null ? <i className={this.props.icon + " icon"}></i> : null;
		return (
			<a className={this.state.active ? "active item" : "item"}>
				{icon}
				{this.props.title}
			</a>
		);
	}
}

export class TabItem

export class CoverArt extends React.Component {
	static defaultProps = {
		id: 0,
		size: 20
	}

	render() {
		return (
			<img className="ui image" src={this.props.subsonic.getUrl("getCoverArt", {id: this.props.id, size: this.props.size})} />
		);
	}
}

export class TabGroup extends React.Component {
	static defaultProps = {
		tabs: []
	}

	componentDidMount() {
		// TODO jquery crap https://github.com/shrimpza/aurial/issues/1
		$('.menu .item').tab();
	}

	render() {
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
}

class Tab extends React.Component {
	static defaultProps = {
		icon: null,
		active: false
	}

	render() {
		var icon = this.props.icon != null ? <i className={this.props.icon + " icon"}></i> : null;
		return (
			<a className={this.props.active ? "active item" : "item"} data-tab={this.props.id}>
				{icon}
				{this.props.title}
			</a>
		);
	}
}

export class IconMessage extends React.Component {
	static defaultProps = {
		icon: "info circle",
		type: "info"
	}

	render() {
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
}
