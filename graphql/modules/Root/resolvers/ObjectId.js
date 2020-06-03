const ObjectId = require('bson').ObjectId;
const { GraphQLScalarType } = require('graphql');

const objectidPattern = /^[0-9a-fA-F]{24}$/;
const isObjectId = str => objectidPattern.test(str);

const parseObjectId = _id => {
	if (isObjectId(_id)) {
		return ObjectId(_id);
	}

	throw new Error('ObjectId must be a single String of 24 hex characters');
};

module.exports = new GraphQLScalarType({
	name: 'ObjectId',
	description: 'The `ObjectId` scalar type represents a mongodb unique ID',
	serialize: String,
	parseValue: parseObjectId,
	parseLiteral: function parseLiteral(ast) {
		return parseObjectId(ast.value);
	}
});
