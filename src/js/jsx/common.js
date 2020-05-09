import {h, Component} from 'preact';
import {UniqueID} from '../util'

export class CoverArt extends Component {
	static defaultProps = {
		id: 0,
		size: 20
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			error: false
		};

		this.popup = this.popup.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({error: false});
	}

	popup() {
		if (this.props.events) this.props.events.publish({
			event: "showImage",
			data: this.props.subsonic.getUrl("getCoverArt", {id: this.props.id})
		});
	}

	render() {
		var style = {maxHeight: this.props.size + "px", maxWidth: this.props.size + "px"};

		var src = this.state.error
			? "css/aurial_200.png"
			: this.props.subsonic.getUrl("getCoverArt", {id: this.props.id, size: this.props.size});

		return (
			<img className="ui image" src={src} style={style}
				onClick={this.popup} onError={() => this.setState({error: true})} />
		);
	}
}

export class TabGroup extends Component {
	static defaultProps = {
		tabs: []
	}

	componentDidMount() {
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

class Tab extends Component {
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

export class IconMessage extends Component {
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

export class Prompt extends Component {
	_id = UniqueID();

	static defaultProps = {
		title: "Question",
		message: "Are you sure?",
		ok: "OK",
		cancel: "Cancel",
		icon: "grey help circle"
	}

	constructor(props, context) {
		super(props, context);

		this.show = this.show.bind(this);
	}

	componentDidMount() {
		$('#' + this._id).modal({
			onApprove: function() {
				this.state.result(true);
			}.bind(this),
			onDeny: function() {
				this.state.result(false);
			}.bind(this)
		});
	}

	show(result) {
		this.setState({result: result});

		$('#' + this._id).modal('show');
	}

	render() {
		return (
			<div id={this._id} className="ui small modal">
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

export class InputPrompt extends Component {
	_id = UniqueID();

	static defaultProps = {
		title: "Prompt",
		message: "Please provide a value",
		ok: "OK",
		cancel: "Cancel",
		icon: "grey edit"
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			value: ""
		};

		this.show = this.show.bind(this);
		this.change = this.change.bind(this);
	}

	componentDidMount() {
		$('#' + this._id).modal({
			onApprove: function() {
				this.state.result(true, this.state.value);
			}.bind(this),
			onDeny: function() {
				this.state.result(false, this.state.value);
			}.bind(this),
		});
	}

	show(value, result) {
		this.setState({value: value, result: result});
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

export class ListPrompt extends Component {
	_id = UniqueID();

	static defaultProps = {
		title: "Prompt",
		message: "Please select an option",
		defaultText: "Select an option...",
		ok: "OK",
		cancel: "Cancel",
		icon: "grey list",
		items: [],
		value: null,
		allowNew: false,
		approve: function() { },
		deny: function() { }
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			value: props.value
		}

		this.show = this.show.bind(this);
	}

	componentDidMount() {
		$('#' + this._id).modal({
			onApprove: function() {
				this.state.approve(true, this.state.value);
			}.bind(this),
			onDeny: function() {
				this.state.approve(false, this.state.value);
			}.bind(this)
		});
	}

	show(approve) {
		this.setState({value: this.props.value, approve: approve});
		var dropdown = $('#' + this._id + ' .dropdown');

		dropdown.dropdown({
			action: 'activate',
			allowAdditions: this.props.allowNew,
			onChange: function(value, text, selectedItem) {
				this.setState({value: value});
			}.bind(this)
		});

		dropdown.dropdown('clear');

		$('#' + this._id).modal('show');
	}

	render() {
		return (
			<div id={this._id} className="ui small modal">
				<div className="header">
					{this.props.title}
				</div>
				<div className="image content">
					<div className="image">
						<i className={this.props.icon + " icon"}></i>
					</div>
					<div className="description">
						<div>{this.props.message}</div>
						<div className="ui basic segment">
							<div className="ui fluid search selection dropdown">
								<i className="dropdown icon"></i>
								<div className="default text">{this.props.defaultText}</div>
								<div className="menu">
									{this.props.items}
								</div>
							</div>
						</div>
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

export class ImageViewer extends Component {
	_id = UniqueID();

	static defaultProps = {
		title: "View",
		ok: "OK"
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			iamge: ""
		};

		props.events.subscribe({
			subscriber: this,
			event: ["showImage"]
		});

		this.show = this.show.bind(this);
	}

	receive(event) {
		if (event.event === "showImage") {
			this.setState({image: event.data});
			this.show();
		}
	}

	componentDidMount() {
		$('#' + this._id).modal();
	}

	show() {
		$('#' + this._id).modal('show');
	}

	render() {
		var center = {
			textAlign: "center",
			maxHeight: "700px"
		};
		return (
			<div id={this._id} className="ui basic modal">
				<div className="header">
					{this.props.title}
				</div>
				<div className="content" style={center}>
					<img src={this.state.image} style={center}/>
				</div>
				<div className="actions">
					<div className="ui basic inverted ok button">{this.props.ok}</div>
				</div>
			</div>
		);
	}
}
