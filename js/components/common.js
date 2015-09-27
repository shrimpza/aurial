var CoverArt = React.createClass({
	render: function() {
		return (
			<img className="ui image" src={this.props.subsonic.getUrl("getCoverArt", {id:this.props.id, size:this.props.size})} />
		);
	}
});
