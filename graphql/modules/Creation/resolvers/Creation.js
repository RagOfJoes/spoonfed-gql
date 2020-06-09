const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');
const LikeModel = require('../../../../db/Likes');
const RecipeModel = require('../../../../db/Recipe');

module.exports = {
	id: async (parent) => {
		const objectidPattern = /^[0-9a-fA-F]{24}$/;
		const isObjectId = (str) => objectidPattern.test(str);
		if (isObjectId(parent)) return parent;

		return parent.id || parent._id;
	},
	recipe: async (parent, _, { loaders: { RecipeLoader } }) => {
		const objectidPattern = /^[0-9a-fA-F]{24}$/;
		const isObjectId = (str) => objectidPattern.test(str);
		if (isObjectId(parent)) {
			try {
				const loadRecipe = await RecipeLoader.load(parent);
				return loadRecipe;
			} catch {}
		}

		try {
			const loadRecipe = await RecipeLoader.load(parent.recipe);

			return loadRecipe;
		} catch {}

		if (isObjectId(parent)) {
			const findRecipe = await RecipeModel.findById(parent);
			return findRecipe;
		}

		return await RecipeModel.findById(parent.recipe);
	},
	isLiked: async (parent, _, { req }) => {
		try {
			const like = await LikeModel.findOne({
				userId: mongoose.Types.ObjectId(req.user.sub),
				creationId: mongoose.Types.ObjectId(parent.id || parent._id),
			});

			return Boolean(like && like.active);
		} catch {}
		return false;
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
