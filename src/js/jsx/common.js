import React from 'react'
import {UniqueID} from '../util'

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

export class Prompt extends React.Component {
	_id = UniqueID();

	static defaultProps = {
		title: "Question",
		message: "Are you sure?",
		ok: "OK",
		cancel: "Cancel",
		icon: "grey help circle",
		approve: function() { },
		deny: function() { }
	}

	constructor(props, context) {
		super(props, context);

		this.show = this.show.bind(this);
	}

	componentDidMount() {
		$('#' + this._id).modal({
			onApprove: this.props.approve,
			onDeny: this.props.deny
		});
	}

	show() {
		$('#' + this._id).modal('show');
	}

	render() {
		return (
			<div id={this._id} className="ui small modal">
				<i className="close icon"></i>
				<div className="header">
					{this.props.title}
				</div>
				<div className="image content">
					<div className="image">
						<i className={this.props.icon + " icon"}></i>
					</div>
					<div className="description">
						{this.props.message}
					</div>
				</div>
				<div className="actions">
					<div className="ui cancel button">{this.props.cancel}</div>
					<div className="ui blue ok button">{this.props.ok}</div>
				</div>
			</div>
		);
	}
}

export class InputPrompt extends React.Component {
	_id = UniqueID();

	static defaultProps = {
		title: "Prompt",
		message: "Please provide a value",
		ok: "OK",
		cancel: "Cancel",
		icon: "grey write",
		approve: function() { },
		deny: function() { }
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			value: props.value
		}

		this.show = this.show.bind(this);
		this.change = this.change.bind(this);
	}

	componentDidMount() {
		$('#' + this._id).modal({
			onApprove: function() {
				this.props.approve(this.state.value);
			}.bind(this),
			onDeny: this.props.deny
		});
	}

	show() {
		this.setState({value: this.props.value});
		$('#' + this._id).modal('show');
	}

	change(e) {
		switch (e.target.name) {
			case "value": this.setState({value: e.target.value}); break;
		}
	}

	render() {
		return (
			<div id={this._id} className="ui small modal">
				<i className="close icon"></i>
				<div className="header">
					{this.props.title}
				</div>
				<div className="image content">
					<div className="image">
						<i className={this.props.icon + " icon"}></i>
					</div>
					<div className="description">
						<form className="ui form" onSubmit={function(e) {e.preventDefault();}}>
							<div className="field">
								<label>{this.props.message}</label>
								<input name="value" type="text" onChange={this.change} value={this.state.value} />
							</div>
						</form>
					</div>
				</div>
				<div className="actions">
					<div className="ui cancel button">{this.props.cancel}</div>
					<div className="ui blue ok button">{this.props.ok}</div>
				</div>
			</div>
		);
	}
}
