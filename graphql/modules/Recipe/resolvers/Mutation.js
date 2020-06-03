const mongoose = require('mongoose');
const recipeScraper = require('recipe-scraper');
const LikeModel = require('../../../../db/Likes');
const slugify = require('../../../../lib/slugify');
const RecipeModel = require('../../../../db/Recipe');
const { authenticated } = require('../../../authResolvers');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
	createRecipe: authenticated(async (_, { recipe }, { req }) => {
		const recipeSlug = slugify(recipe.name);
		const newRecipeModel = await new RecipeModel({
			...recipe,
			slug: recipeSlug,
			createdBy: req.user.sub,
		}).save();

		return newRecipeModel;
	}),
	editRecipe: authenticated(async (_, { id, recipe }, { req }) => {
		const findRecipe = await RecipeModel.findById(id);

		if (!findRecipe) throw new Error('Invalid Recipe!');

		if (!mongoose.Types.ObjectId(req.user.sub).equals(mongoose.Types.ObjectId(findRecipe.createdBy))) {
			throw new AuthenticationError('You are not authorized to edit this Recipe');
		}

		const isValidLength = (key) => {
			if (!recipe[key]) return false;

			if (recipe[key] && recipe[key].length <= 0) return false;

			return true;
		};

		const editedRecipe = recipe;

		if (!isValidLength('name')) throw new Error('Name cannot be empty');

		if (recipe.name && recipe.name !== findRecipe.name) editedRecipe.slug = slugify(recipe.name);

		if (!isValidLength('images')) throw new Error('Images cannot be empty');

		if (!isValidLength('servings')) throw new Error('Servings cannot be empty!');

		if (!isValidLength('ingredients')) throw new Error('Ingredients cannot be empty!');

		if (!isValidLength('instructions')) throw new Error('Instructions cannot be empty!');

		const updateRecipe = await RecipeModel.findByIdAndUpdate(
			id,
			{ ...editedRecipe, 'date.lastUpdate': new Date(), $inc: { __v: 1 } },
			{ new: true, omitUndefined: false }
		);

		return updateRecipe;
	}),
	likeRecipe: authenticated(async (_, { recipeId }, { req }) => {
		if (!recipeId) throw new Error('Must provide a recipe id');

		try {
			const liked = await LikeModel.findOneAndUpdate(
				{ recipeId, userId: req.user.sub },
				{ active: true },
				{ new: true, upsert: true }
			);

			return { id: liked.recipeId, isLiked: true };
		} catch {}
		return null;
	}),
	unlikeRecipe: authenticated(async (_, { recipeId }, { req }) => {
		if (!recipeId) throw new Error('Must provide a recipe id');

		try {
			const liked = await LikeModel.findOneAndUpdate({ recipeId, userId: req.user.sub }, { active: false });

			return { id: liked.recipeId, isLiked: false };
		} catch {}

		return null;
	}),
	parseRecipeUrl: authenticated(async (_, { url }, { req }) => {
		return await recipeScraper(url);
	}),
};
