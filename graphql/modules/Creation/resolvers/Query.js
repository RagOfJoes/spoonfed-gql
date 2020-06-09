const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');
const CreationModel = require('../../../../db/Creation');
const cursorPagination = require('../../../../lib/cursorPagination');

module.exports = {
	getCreationDetail: async (_, { slug }) => {
		try {
			const creation = await CreationModel.findOne({ slug });
			return creation;
		} catch {}

		throw new Error('Could not find Creation!');
	},
	getAllCreations: async (_, { limit, cursor, sort = { creation: 'DESC' }, ctx }) => {
		const aggregate = async (match, sortKey, sortOrder, limitQuery) => {
			return await CreationModel.aggregate()
				.match(match)
				.sort({ [sortKey]: sortOrder.toLowerCase() })
				.limit(limitQuery);
		};
		// await customAggregate(match, sortOrder, limitQuery)
		return await cursorPagination(limit, cursor, null, sort, {}, null, await aggregate);
	},
	getUserCreations: async (_, { user, limit, cursor, filters = [], sort = { creation: 'DESC' } }, ctx) => {
		const findUser = await UserModel.findOne({ username: user }, 'sub').lean();

		if (!findUser) throw new Error('User not found!');

		const aggregate = async (match, sortKey, sortOrder, limitQuery) => {
			return await CreationModel.aggregate()
				.match(match)
				.sort({ [sortKey]: sortOrder.toLowerCase() })
				.limit(limitQuery);
		};

		return await cursorPagination(
			limit,
			cursor,
			filters,
			sort,
			{
				createdBy: { $eq: mongoose.Types.ObjectId(findUser.sub) },
			},
			null,
			await aggregate
		);
	},
};
