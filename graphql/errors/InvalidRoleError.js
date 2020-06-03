const { ApolloError } = require('apollo-server-express');

class InvalidRoleError extends ApolloError {
	constructor(message) {
		super(message, 'INVALID_ROLE');

		Object.defineProperty(this, 'name', { value: 'InvalidRoleError' });
	}
}

module.exports = InvalidRoleError;
