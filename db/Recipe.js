const mongoose = require('mongoose');

/**
 * Recipe Schema
 */
const RecipeSchema = new mongoose.Schema({
	name: { text: true, type: String, required: true, minlength: 4, maxlength: 60 },
	servings: { type: String, required: true },
	ingredients: [{ type: String, required: true }],
	instructions: [{ type: String, required: true }],
	images: [{ name: { type: String, required: true }, url: { type: String, required: true } }],
	time: {
		prep: String,
		cook: String,
		ready: String,
		total: String,
		active: String,
		inactive: String,
	},

	// Metadata
	slug: {
		index: true,
		type: String,
		unique: true,
		required: true,
	},
	createdBy: {
		ref: 'User',
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
	importUrl: { type: String },
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

module.exports = mongoose.model('Recipe', RecipeSchema);
