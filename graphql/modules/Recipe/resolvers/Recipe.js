const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');
const LikeModel = require('../../../../db/Likes');
const { encode } = require('../../../../lib/base64');
const objKeyFromString = require('../../../../lib/objKeyFromString');

module.exports = {
	id: async (parent) => {
		const objectidPattern = /^[0-9a-fA-F]{24}$/;
		const isObjectId = (str) => objectidPattern.test(str);
		if (isObjectId(parent)) return parent;

		return parent.id || parent._id;
	},
	cursor: async (parent, { field = 'creation' }, __) => {
		if (field === 'creation' || field === 'lastUpdate') {
			// If not seperated by a period
			const cursor = objKeyFromString('date.' + field, parent);

			if (!cursor) return encode(new Date(parent.date.creation).toJSON());

			return encode(new Date(cursor).toJSON());
		}

		const cursor = objKeyFromString(field, parent);

		if (!cursor) return encode(new Date(parent.date.creation).toJSON());

		return encode(cursor);
	},
	isLiked: async (parent, _, { req }) => {
		try {
			const like = await LikeModel.findOne({
				userId: mongoose.Types.ObjectId(req.user.sub),
				recipeId: mongoose.Types.ObjectId(parent.id || parent._id),
			});

			return Boolean(like && like.active);
		} catch {}
		return false;
	},
	numOfLikes: async (parent, _, { req }) => {
		if (!parent.id && !parent._id) throw new Error('Must provide a Recipe ID to get Number of Likes');

		if (parent.numOfLikes) return parent.numOfLikes;

		const likes = await LikeModel.find({ active: true, recipeId: parent.id || parent._id });
		return likes.length;
	},
	createdBy: async ({ createdBy }, _, { req, loaders: { UserLoader } }) => {
		try {
			const loadUser = await UserLoader.load(createdBy);
			
			return loadUser;
		} catch {}

		const findUser = await UserModel.findOne({ sub: createdBy });

		if (findUser) return findUser;

		const newUser = await new UserModel(req.user).save();
		return newUser;
	},
};
