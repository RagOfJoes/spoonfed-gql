const { gql } = require('apollo-server-express');

module.exports = gql`
	type Creation {
		id: ObjectId!
		title: String!
		images: [Image!]!
		description: String

		# Metadata
		slug: String!
		date: MetaDate!
		recipe: Recipe!
		createdBy: User!
		isLiked: Boolean
	}

	type Creations {
		edges: [Creation]
		pageInfo: PageInfo!
	}

	input CreationsFilterInput {
		recipe: IdFilterInput
	}

	extend type Query {
		getCreationDetail(slug: String!): Creation
		getAllCreations(limit: Int!, cursor: ID, sort: CursorSortInput!, filters: [CreationsFilterInput]): Creations
		getUserCreations(user: String!, limit: Int!, cursor: ID, sort: CursorSortInput!): Creations
	}

	input CreationImageInput {
		url: String!
		name: String!
	}

	input NewCreationInput {
		title: String!
		description: String
		images: [CreationImageInput!]!

		recipe: String!
	}

	input EditCreationInput {
		title: String!
		description: String
		images: [CreationImageInput!]!
	}

	extend type Mutation {
		likeCreation(creationId: ObjectId!): Creation!
		unlikeCreation(creationId: ObjectId!): Creation!

		newCreation(creation: NewCreationInput!): Creation!
		editCreation(id: ObjectId!, creation: EditCreationInput): Creation!
	}
`;
