const URL = require('url');
const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');
const RecipeModel = require('../../../../db/Recipe');
const cursorPagination = require('../../../../lib/cursorPagination');

module.exports = {
	getRecipeDetail: async (_, { slug }, { req }) => {
		try {
			const recipe = await RecipeModel.findOne({ slug });
			return recipe;
		} catch {}

		throw new Error('Could not find Recipe!');
	},
	getUserRecipes: async (_, { user, limit, cursor, filters = [], sort = { creation: 'DESC' } }, ctx) => {
		const findUser = await UserModel.findOne({ username: user }, 'sub').lean();

		if (!findUser) throw new Error('User not found!');

		return await cursorPagination(limit, cursor, filters, sort, {
			createdBy: { $eq: mongoose.Types.ObjectId(findUser.sub) },
		});
	},
	getAllRecipes: async (_, { limit, cursor, filters = [], sort = { creation: 'DESC' }, ctx }) => {
		return await cursorPagination(limit, cursor, filters, sort);
	},
};
