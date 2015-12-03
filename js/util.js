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
	return this;
}

Array.prototype.shuffle = function() {
    var counter = this.length, temp, index;

    while (counter > 0) {
        index = (Math.random() * counter--) | 0;

        temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }

    return this;
}

Date.prototype.toSimpleString = function() {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return this.getDate() + " " + months[this.getMonth()] + " " + this.getFullYear();
}

UniqueID = function() {
	return Math.random().toString().replace(/[^A-Za-z0-9]/, "");
}