const mongoose = require('mongoose');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
	email: {
		trim: true,
		index: true,
		type: String,
		unique: true,
		required: [true, 'Email must not be empty!'],
	},
	sub: {
		index: true,
		unique: true,
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
	given_name: {
		type: String,
		required: [true, 'First Name must not be empty!'],
	},
	family_name: {
		type: String,
		required: [true, 'Last Name must not be empty!'],
	},
	join_date: {
		type: Date,
		required: true,
		default: Date.now,
	},

	avatar: {
		type: String,
	},
	bio: {
		type: String,
		maxlength: 120,
	},
	username: {
		text: true,
		index: true,
		unique: true,
		type: String,
		minlength: 4,
		maxlength: 16,
		// Creates a case
		// insensitive index
		collation: {
			strength: 2,
			locale: 'en',
		},
	},
});

module.exports = mongoose.model('User', UserSchema);
