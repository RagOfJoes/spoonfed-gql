const mongoose = require('mongoose');

const creationImageLimit = (value) => {
	return value.length <= 3;
};
/**
 * Creation Schema
 */
const CreationSchema = new mongoose.Schema({
	title: { text: true, type: String, required: true },
	description: { type: String },
	images: {
		type: [{ name: { type: String, required: true }, url: { type: String, required: true } }],
		validate: [creationImageLimit, 'A creation can only contain 3 images'],
	},
	rating: { type: Number, default: 0 },
	comments: [
		{
			comment: String,
			user: { ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
			date: {
				// Will be used as cursor for Pagination
				creation: {
					type: Date,
					required: true,
					default: Date.now,
				},
				lastUpdate: {
					type: Date,
				},
			},
		},
	],

	// Metadata
	slug: {
		index: true,
		type: String,
		unique: true,
		required: true,
	},
	recipe: {
		ref: 'Recipe',
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
	createdBy: {
		ref: 'User',
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
	date: {
		// Will be used as cursor for Pagination
		creation: {
			type: Date,
			required: true,
			default: Date.now,
		},
		lastUpdate: {
			type: Date,
		},
	},
});

module.exports = mongoose.model('Creation', CreationSchema);
