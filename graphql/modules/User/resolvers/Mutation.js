const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');
const { authenticated } = require('../../../authResolvers');

module.exports = {
	logout: async (_, __, { req, redisCache }) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			await redisCache.delete(`accessToken:${token}:user`);
		} catch {}
		return true;
	},
	editProfile: authenticated(async (_, { profile }, { req }) => {
		const edit = await UserModel.findOneAndUpdate({ sub: req.user.sub }, profile, {
			new: true,
			upsert: true,
			omitUndefined: false,
		});

		return edit;
	}),
};
