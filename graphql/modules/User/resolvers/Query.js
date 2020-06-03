const UserModel = require('../../../../db/User');
const { authenticated } = require('../../../authResolvers');

module.exports = {
	me: authenticated(async (_, __, { req, loaders: { UserLoader } }) => {
		try {
			const loadUser = await UserLoader.load(req.user.sub);

			return loadUser;
		} catch {}

		const findMe = await UserModel.findOne({ sub: req.user.sub });

		if (!findMe) {
			const { sub, email, given_name, family_name } = req.user;
			const newMe = new UserModel({ sub, email, given_name, family_name });

			try {
				await newMe.save();
				return newMe;
			} catch {}
		}

		return findMe;
	}),
	getProfile: async (_, { username }, { req }) => {
		const findUser = await UserModel.findOne({ username }).lean();

		if (!findUser) throw new Error('User not found!');

		return findUser;
	},
};
