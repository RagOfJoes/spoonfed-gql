const { ApolloError } = require('apollo-server-express');

class InvalidUsernameError extends ApolloError {
	constructor(message) {
		super(message, 'INVALID_USERNAME');

		Object.defineProperty(this, 'name', { value: 'InvalidUsernameError' });
	}
}

module.exports = InvalidUsernameError;
