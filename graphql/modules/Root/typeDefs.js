const { gql } = require('apollo-server-express');

module.exports = gql`
	# Custom Scalars
	scalar RGB
	scalar Date
	scalar Email
	scalar ObjectId

	# File Types
	type Image {
		url: String!
		name: String!
	}

	type MetaDate {
		creation: Date!
		lastUpdate: Date
	}

	enum SORT_ORDER {
		ASC
		DESC
	}

	type PageInfo {
		cursor: ID!
		hasNextPage: Boolean!
	}

	input UserFilterInput {
		is: ObjectId
		notIs: ObjectId

		has: [ObjectId]
		notHas: [ObjectId]
	}

	input IntFilterInput {
		equals: Int
		lessThan: Int
		greaterThan: Int
	}

	input StringFilterInput {
		contains: String
	}

	input DateFilterInput {
		after: Date
		before: Date
		equals: Date
		between: [Date]
	}

	# These are to be extended for further useage
	type Query {
		_: String
	}
	type Mutation {
		_: String
	}
	type Subscription {
		_: String
	}
`;
