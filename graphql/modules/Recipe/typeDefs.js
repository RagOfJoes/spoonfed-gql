const { gql } = require('apollo-server-express');

module.exports = gql`
	enum RECIPE_SORT_KEYS {
		name

		creation
	}

	type Recipe {
		id: ObjectId!
		name: String!
		numOfLikes: Int
		images: [Image!]!
		servings: String!
		time: RecipeTimeType
		ingredients: [String!]!
		instructions: [String!]!

		# Metadata
		slug: String!
		date: MetaDate!
		createdBy: User!
		isLiked: Boolean
		importUrl: String
		cursor(field: RECIPE_SORT_KEYS!): ID
	}

	type ParsedRecipe {
		name: String
		image: String
		servings: String
		time: RecipeTimeType
		ingredients: [String]
		instructions: [String]
	}

	type RecipeTimeType {
		prep: String
		cook: String
		ready: String
		total: String!
		active: String
		inactive: String
	}

	type Recipes {
		edges: [Recipe]
		pageInfo: PageInfo!
	}

	input RecipesFilterInput {
		likes: IntFilterInput
		creation: DateFilterInput

		name: StringFilterInput
	}

	extend type Query {
		getRecipeDetail(slug: String!): Recipe
		getAllRecipes(limit: Int!, cursor: ID, sort: CursorSortInput!, filters: [RecipesFilterInput]): Recipes
		getUserRecipes(user: String!, limit: Int!, cursor: ID, sort: CursorSortInput!, filters: [RecipesFilterInput]): Recipes
	}

	input RecipeImageInput {
		name: String!
		url: String!
	}

	input RecipeTimeInput {
		prep: String
		cook: String
		ready: String
		total: String!
		active: String
		inactive: String
	}

	input NewRecipeInput {
		name: String!
		servings: String!
		importUrl: String
		time: RecipeTimeInput
		ingredients: [String!]!
		instructions: [String!]!
		images: [RecipeImageInput!]!
	}

	input EditRecipeInput {
		name: String!
		servings: String!
		time: RecipeTimeInput
		ingredients: [String!]!
		instructions: [String!]!
		images: [RecipeImageInput!]!
	}

	extend type Mutation {
		likeRecipe(recipeId: ObjectId!): Recipe!
		unlikeRecipe(recipeId: ObjectId!): Recipe!

		parseRecipeUrl(url: String!): ParsedRecipe!

		createRecipe(recipe: NewRecipeInput!): Recipe!
		editRecipe(id: ObjectId!, recipe: EditRecipeInput): Recipe!
	}
`;
