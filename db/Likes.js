const mongoose = require('mongoose');

/**
 * Likes Schema
 */
const LikesSchema = new mongoose.Schema({
	userId: {
		ref: 'User',
		index: true,
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
	recipeId: {
		index: true,
		ref: 'Recipe',
		type: mongoose.Schema.Types.ObjectId,
		required: () => Boolean(!this.creationId),
	},
	creationId: {
		index: true,
		ref: 'Creation',
		type: mongoose.Schema.Types.ObjectId,
		required: () => Boolean(!this.recipeId),
	},
	active: {
		index: true,
		type: Boolean,
		required: true,
		default: false,
	},
});

module.exports = mongoose.model('Likes', LikesSchema);
