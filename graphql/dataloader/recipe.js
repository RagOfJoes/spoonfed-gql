const DataLoader = require('dataloader');
const RecipeModel = require('../../db/Recipe');

/**
 *
 * @param {Array} ids
 */
const batchRecipes = async (ids) => {
	const recipes = await RecipeModel.find({ _id: { $in: ids } }).lean();

	const mapRecipes = {};
	recipes.map((recipe) => {
		const { _id } = recipe;

		if (mapRecipes[_id]) return;

		mapRecipes[_id] = recipe;
	});

	return ids.map((id) => mapRecipes[id]);
};

const RecipeLoader = () => new DataLoader(batchRecipes);

module.exports = { RecipeLoader };
