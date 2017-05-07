/**
* Format a number of seconds in a more user-friendly "mm:ss" string format.
*/
export function SecondsToTime(seconds) {
	var mins = Math.floor(seconds / 60);
	var hours = Math.floor(mins / 60);
	var secs = Math.floor(seconds % 60);

	var hourString = "";
	if (hours > 0) {
		mins -= hours * 60;
		hourString = hours.toString() + (mins < 10 ? ":0" : ":");
	}

	return hourString + mins.toString() + ":" + (secs < 10 ? "0" + secs.toString() : secs.toString());
}

/**
* Return a string as hex.
*/
export function HexEncode(string) {
	var result = "";
	for (var i = 0; i < string.length; i++) {
		result += string.charCodeAt(i).toString(16);
	}
	return result;
}

/**
* Remove the provided element from an array.
*/
export function ArrayDeleteElement(array, element) {
	var i = array.indexOf(element);
	if (i > -1) array.splice(i, 1);
	return array;
}

/**
* Shuffle and return the array.
*/
export function ArrayShuffle(array) {
	var counter = array.length, temp, index;

	while (counter > 0) {
		index = (Math.random() * counter--) | 0;

		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}

/**
* Generate a random whole number.
*/
export function UniqueID() {
	return Math.random().toString().replace(/[^A-Za-z0-9]/, "");
}
