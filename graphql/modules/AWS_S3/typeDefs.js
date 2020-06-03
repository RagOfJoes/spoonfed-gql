const { gql } = require('apollo-server-express');

module.exports = gql`
	type s3Payload {
		fileUrl: String!
		signedUrl: String!
	}

	input FileUpload {
		filename: String!
		filetype: String!
	}

	extend type Mutation {
		signS3Single(file: FileUpload!): s3Payload!
		signS3Multiple(files: [FileUpload!]!): [s3Payload]!
	}
`;
