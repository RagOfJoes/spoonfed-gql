const { ApolloError } = require('apollo-server-express');

class InvalidCreationError extends ApolloError {
	constructor(message) {
		super(message, 'INVALID_CREATION');

		Object.defineProperty(this, 'name', { value: 'InvalidCreationError' });
	}
}

module.exports = InvalidCreationError;
