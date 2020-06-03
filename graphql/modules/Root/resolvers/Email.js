const { Kind } = require('graphql/language');
const { GraphQLScalarType } = require('graphql');
const { GraphQLError } = require('graphql/error');

/* eslint-disable no-useless-escape */
const EMAIL_ADDRESS_REGEX = new RegExp( // Reg. Exp. to test if input is valid Email Address
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
/* eslint-enable */

module.exports = new GraphQLScalarType({
	name: 'Email',

	description: 'Email Address Scalar type',

	serialize(value) {
		if (typeof value !== 'string') {
			throw new TypeError(`Value is not string: ${value}`);
		}

		if (!EMAIL_ADDRESS_REGEX.test(value)) {
			throw new TypeError(`Value is not a valid email address: ${value}`);
		}

		return value;
	},

	parseValue(value) {
		if (typeof value !== 'string') {
			throw new TypeError('Value is not string');
		}

		if (!EMAIL_ADDRESS_REGEX.test(value)) {
			throw new TypeError(`Value is not a valid email address: ${value}`);
		}

		return value;
	},

	parseLiteral(ast) {
		if (ast.kind !== Kind.STRING) {
			throw new GraphQLError(`Can only validate strings as email addresses but got a: ${ast.kind}`);
		}

		if (!EMAIL_ADDRESS_REGEX.test(ast.value)) {
			throw new TypeError(`Value is not a valid email address: ${ast.value}`);
		}

		return ast.value;
	}
});
