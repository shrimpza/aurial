Number.prototype.asTime = function() {
	var mins = Math.floor(this / 60);
	var seconds = Math.floor(this % 60);
	return mins.toString() + ":" + (seconds < 10 ? "0" + seconds.toString() : seconds.toString());
}

String.prototype.hexEncode = function() {
    var result = "";
    for (var i = 0; i < this.length; i++) {
        result += this.charCodeAt(i).toString(16);
    }

    return result
}

Array.prototype.delete = function(element) {
	var i = this.indexOf(element);
	if (i > -1) this.splice(i, 1);
}

UniqueID = function() {
	return Math.random().toString().replace(/[^A-Za-z0-9]/, "");
}