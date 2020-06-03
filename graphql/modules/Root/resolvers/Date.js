const { Kind } = require('graphql/language');
const { GraphQLScalarType } = require('graphql');

const DateTime = new GraphQLScalarType({
	name: 'Date',

	description: 'Date fields to JS Date Object',

	parseValue(value) {
		return new Date(value);
	},

	serialize(value) {
		return value;
	},

	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			return new Date(ast.value);
		}
		return null;
	}
});

module.exports = DateTime;
