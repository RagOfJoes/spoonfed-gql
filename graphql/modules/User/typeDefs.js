const { gql } = require('apollo-server-express');

module.exports = gql`
	type User {
		# From AS Server
		email: Email!
		sub: ObjectId!
		name: UserName
		join_date: Date!

		bio: String
		avatar: String
		username: String
	}

	type UserName {
		first: String
		last: String
		full: String
	}

	extend type Query {
		me: User!
		getProfile(username: String!): User!
	}

	input EditProfileInput {
		bio: String
		avatar: String
		username: String
	}

	extend type Mutation {
		logout: Boolean!
		editProfile(profile: EditProfileInput): User!
	}
`;
