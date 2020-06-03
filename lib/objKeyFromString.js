/**
 * Retrieve Object Value from a "." seperated String
 * @param {String} path Example: "date.creation"
 * @param {Object} obj
 */
const objKeyFromString = (path, obj) => {
	return path.split('.').reduce(function (prev, curr) {
		return prev ? prev[curr] : null;
	}, obj);
};

module.exports = objKeyFromString;
