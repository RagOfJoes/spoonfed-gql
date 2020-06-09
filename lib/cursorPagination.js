const mongoose = require('mongoose');
const RecipeModel = require('../db/Recipe');
const { decode, encode } = require('../lib/base64');
const objKeyFromString = require('../lib/objKeyFromString');

/**
 * Decode base64 encoded cursor
 * @param {String} toDecode
 * @param {String} sortKey
 */
const getDecoded = (toDecode, sortKey) => {
	if (!toDecode || typeof toDecode !== 'string') return new Date();

	if (sortKey === 'date.creation') {
		return new Date(decode(toDecode));
	}
	return decode(toDecode);
};

/**
 * Encode value to base64
 * @param {Array} arr
 * @param {String} sortKey
 */
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

/**
 *
 * @param {String} key
 */
const parseSortKey = (key) => {
	switch (key) {
		case 'name':
		case 'slug':
			return 'slug';
		case 'username':
			return 'username';
		case 'creation':
			return 'date.' + key;
		default:
			return 'date.creation';
	}
};

/**
 *
 * @param {String} key
 */
const parseDateKey = (key) => {
	switch (key) {
		case 'creation':
			return 'date.creation';
	}
};

/**
 * Create an aggregate pipeline based on filters
 * selected
 * @param {Object} match
 * @param {Array} filters
 */
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
			clone = {
				$and: [
					{ ...clone[[parseDateKey(filterKey)]] },
					{ [parseDateKey(filterKey)]: { $gte: fromDate } },
					{ [parseDateKey(filterKey)]: { $lte: toDate } },
				],
			};
		} else if (filterQuery.is) {
			clone = { [filterKey]: { $eq: mongoose.Types.ObjectId(filterQuery.is) }, ...clone };
		} else if (filterQuery.notIs) {
			clone = { [filterKey]: { $ne: mongoose.Types.ObjectId(filterQuery.is) }, ...clone };
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
 * Cursor paginate data
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
	try {
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
		const agg =
			typeof customAggregate === 'function'
				? await customAggregate(match, sortKey, sortOrder, limitQuery)
				: await RecipeModel.aggregate()
						.match(match)
						.sort({ [sortKey]: sortOrder.toLowerCase(), ...additionalSort })
						.limit(limitQuery);

		if (!agg) throw new Error("Uh-oh couldn't fetch pages!");

		const arr = Array.from(agg);
		const hasNextPage = arr.length > limit;

		if (hasNextPage) arr.pop();
		const newCursor = getCursor(arr, sortKey);
		const newPageInfo = { hasNextPage, cursor: newCursor };

		const payload = {
			edges: arr || [],
			pageInfo: newPageInfo,
		};
		return payload;
	} catch (e) {}
};

module.exports = cursorPagination;
