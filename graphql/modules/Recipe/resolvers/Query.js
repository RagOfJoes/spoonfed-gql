const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');
const RecipeModel = require('../../../../db/Recipe');
const { decode, encode } = require('../../../../lib/base64');
const objKeyFromString = require('../../../../lib/objKeyFromString');

const getDecoded = (toDecode, sortKey) => {
	if (!toDecode || typeof toDecode !== 'string') return new Date();

	if (sortKey === 'date.creation') {
		return new Date(decode(toDecode));
	}

	return decode(toDecode);
};

const getCursor = (arr, sortKey) => {
	const parsed = parseSortKey(sortKey);
	const d = objKeyFromString(parsed, arr[arr.length - 1]);
	try {
		if (parsed === 'date.creation') {
			return encode(new Date(d).toJSON());
		}
	} catch (e) {}
	return encode(d || '');
};

const parseSortKey = (key) => {
	switch (key) {
		case 'name':
		case 'slug':
			return 'slug';
		case 'creation':
			return 'date.' + key;
		default:
			return 'date.creation';
	}
};

const parseDateKey = (key) => {
	switch (key) {
		case 'creation':
			return 'date.creation';
	}
};

// Create a match aggregate operation based on Filters selected
const filterMatch = (match, filters) => {
	let clone = match;
	filters.forEach((filter) => {
		const filterKey = Object.keys(filter)[0];
		const filterQuery = Object.values(filter)[0];

		if (filterQuery.contains) clone = { $text: { $search: `"${filterQuery.contains}"` }, ...clone };
		// For Dates
		else if (filterQuery.after) {
			clone = { [parseDateKey(filterKey)]: { $gt: new Date(filterQuery.after) }, ...clone };
		} else if (filterQuery.before) {
			clone = { [parseDateKey(filterKey)]: { $lt: new Date(filterQuery.before) }, ...clone };
		} else if (filterQuery.equals) {
			clone = { [parseDateKey(filterKey)]: { $eq: new Date(filterQuery.before) }, ...clone };
		} else if (filterQuery.between) {
			const toDate = new Date(filterQuery.between[1]);
			const fromDate = new Date(filterQuery.between[0]);
			clone = { [parseDateKey(filterKey)]: { $gte: fromDate, $lte: toDate }, ...clone };
		} else if (filterQuery.is) {
			const clone = { [filterKey]: { $eq: mongoose.Types.ObjectId(filterQuery.is) }, ...clone };
		} else if (filterQuery.notIs) {
			const clone = { [filterKey]: { $ne: mongoose.Types.ObjectId(filterQuery.is) }, ...clone };
		} else if (filterQuery.has) {
			const op = filterQuery.has.map((v) => ({ [filterKey]: { $eq: mongoose.Types.ObjectId(v) } }));
			if (!clone.$and) Object.assign(clone, { $and: [{ $or: op }] });
			else clone.$and.push({ $or: op });
		} else if (filterQuery.notHas) {
			const op = filterQuery.notHas.map((v) => ({ [filterKey]: { $ne: mongoose.Types.ObjectId(v) } }));
			if (!clone.$and) Object.assign(clone, { $and: [{ $or: op }] });
			else clone.$and.push({ $or: op });
		}
	});
	return clone;
};

/**
 *
 * @param {Number} limit
 * @param {String} cursor
 * @param {Array} filters
 * @param {Object} sort
 * @param {Object} initMatch
 * @param {Object} additionalSort
 * @param {Function} customAggregate
 */
const cursorPagination = async (
	limit,
	cursor,
	filters = [],
	sort = { creation: 'DESC' },

	// Custom Params
	initMatch = {},
	additionalSort = {},
	customAggregate
) => {
	const sortKey = parseSortKey(Object.keys(sort)[0]);
	const sortOrder = Object.values(sort)[0];
	// Decode utf-8 encoded cursort
	const decoded = getDecoded(cursor, sortKey);
	const op = Object.values(sort)[0] === 'ASC' ? '$gt' : '$lt';
	const cursorQuery = { [op]: decoded };
	const limitQuery = limit + 1;
	let match = initMatch;

	if (filters && filters.length > 0) match = filterMatch(match, filters);
	if (cursor) match = { [sortKey]: cursorQuery, ...match };
	const recipes =
		typeof customAggregate === 'function'
			? await customAggregate(match, sortOrder, limitQuery)
			: await RecipeModel.aggregate()
					.match(match)
					.sort({ [sortKey]: sortOrder.toLowerCase(), ...additionalSort })
					.limit(limitQuery);

	if (!recipes) throw new Error("Uh-oh couldn't fetch Recipes!");

	const arr = Array.from(recipes);
	const hasNextPage = arr.length > limit;

	if (hasNextPage) arr.pop();

	const newCursor = getCursor(arr, sortKey);
	const newPageInfo = { hasNextPage, cursor: newCursor };

	const payload = {
		edges: arr || [],
		pageInfo: newPageInfo,
	};
	return payload;
};

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
	getAllRecipes: async (_, { limit, cursor, filters = [], sort = { likes: 'DESC' }, ctx }) => {
		return await cursorPagination(limit, cursor, filters, sort);
	},
};
