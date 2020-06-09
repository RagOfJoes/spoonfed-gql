const { UserLoader } = require('./user');
const { RecipeLoader } = require('./recipe');

module.exports = {
	UserLoader: UserLoader(),
	RecipeLoader: RecipeLoader(),
};
