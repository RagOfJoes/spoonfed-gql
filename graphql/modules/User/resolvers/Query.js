const UserModel = require('../../../../db/User');
const { authenticated } = require('../../../authResolvers');
const cursorPagination = require('../../../../lib/cursorPagination');

module.exports = {
	me: authenticated(async (_, __, { req }) => {
		const findMe = await UserModel.findOne({ sub: req.user.sub });

		return findMe;
	}),
	getProfile: async (_, { username }, { req }) => {
		const findUser = await UserModel.findOne({ username }).lean();

		if (!findUser) throw new Error('User not found!');

		return findUser;
	},
	userSearch: async (_, { username, limit, cursor }, { req }) => {
		const sort = { username: 'ASC' };

		try {
			const aggregate = async (match, sortKey, sortOrder, limitQuery) => {
				const custMatch = { username: { $regex: username, $options: 'i' } };

				if (match && match.username) custMatch.username = { ...match.username, ...custMatch.username };

				return await UserModel.aggregate()
					.match(custMatch)
					.sort({ [sortKey]: sortOrder.toLowerCase() })
					.limit(limitQuery);
			};
			return await cursorPagination(limit, cursor, null, sort, null, null, await aggregate);
		} catch (e) {}

		return {
			edges: [],
			pageInfo: {
				cursor: null,
				hasNextPage: false,
			},
		};
	},
};
