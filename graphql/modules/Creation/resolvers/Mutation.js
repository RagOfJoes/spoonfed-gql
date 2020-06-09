const URL = require('url');
const mongoose = require('mongoose');
const LikeModel = require('../../../../db/Likes');
const slugify = require('../../../../lib/slugify');
const RecipeModel = require('../../../../db/Recipe');
const CreationModel = require('../../../../db/Creation');
const { InvalidCreationError } = require('../../../errors');
const { authenticated } = require('../../../authResolvers');

module.exports = {
	likeCreation: authenticated(async (_, { creationId }, { req }) => {
		if (!creationId) throw new InvalidCreationError('Must provide a creation id');

		try {
			const liked = await LikeModel.findOneAndUpdate(
				{ creationId, userId: req.user.sub },
				{ active: true },
				{ new: true, upsert: true }
			);

			return { id: liked.creationId, isLiked: true };
		} catch {}
		return null;
	}),
	unlikeCreation: authenticated(async (_, { creationId }, { req }) => {
		if (!creationId) throw new Error('Must provide a creation id');

		try {
			const liked = await LikeModel.findOneAndUpdate(
				{ creationId, userId: req.user.sub },
				{ active: false },
				{ new: true, upsert: true }
			);

			return { id: liked.creationId, isLiked: false };
		} catch {}

		return null;
	}),
	newCreation: authenticated(async (_, { creation }, { req }) => {
		const { title, images, recipe } = creation;

		if (images.length === 0) throw new InvalidCreationError('Must provide atleast one image!');

		const { pathname } = URL.parse(recipe);

		const slug = pathname.split('/');

		if (slug.length < 3 || slug[1] !== 'r') throw new InvalidCreationError('Invalid Recipe URL!');

		let _recipe;
		try {
			// Only pull _id from Recipe
			_recipe = await RecipeModel.findOne({ slug: slug[2] }, '_id').lean();
		} catch (e) {}

		if (!_recipe) throw new InvalidCreationError('Invalid Recipe URL!');

		let _creation;

		try {
			const slug = slugify(title);
			_creation = await new CreationModel({
				...creation,
				slug,
				recipe: _recipe._id,
				createdBy: req.user.sub,
			}).save();

			return _creation;
		} catch (e) {}

		throw new InvalidCreationError('Failed to make a new Creation! Try again later');
	}),
	editCreation: authenticated(async (_, { id, creation }, { req }) => {
		const findCreation = await CreationModel.findById(id);

		if (!findCreation) throw new Error('Invalid Recipe!');

		if (!mongoose.Types.ObjectId(req.user.sub).equals(mongoose.Types.ObjectId(findCreation.createdBy))) {
			throw new AuthenticationError('You are not authorized to edit this Recipe');
		}

		const isValidLength = (key) => {
			if (!creation[key]) return false;

			if (creation[key] && creation[key].length <= 0) return false;

			return true;
		};

		const editedCreation = creation;

		if (!isValidLength('title')) throw new Error('Name cannot be empty');

		if (creation.title && creation.title !== findCreation.title) editedCreation.slug = slugify(creation.title);

		if (!isValidLength('images')) throw new Error('Images cannot be empty');

		const updateCreation = await CreationModel.findByIdAndUpdate(
			id,
			{ ...editedCreation, 'date.lastUpdate': new Date(), $inc: { __v: 1 } },
			{ new: true, omitUndefined: false }
		);

		return updateCreation;
	}),
};
