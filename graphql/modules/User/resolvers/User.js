const mongoose = require('mongoose');
const UserModel = require('../../../../db/User');

module.exports = {
	email: async (parent, _, __) => {
		return parent.email;
	},
	name: async (parent, _, __) => {
		const { given_name, family_name } = parent;
		const full = `${given_name} ${family_name}`;
		return {
			full,
			first: given_name,
			last: family_name,
		};
	},

	bio: async (parent, _, { req, loaders: { UserLoader } }) => {
		try {
			const loadUser = await UserLoader.load(parent.sub);

			return loadUser.bio;
		} catch (e) {}

		const payload = await UserModel.findOne({ $or: [{ sub: parent.sub }, { _id: mongoose.Types.ObjectId(parent.id) }] });

		return payload.bio;
	},
	avatar: async (parent, _, { req, loaders: { UserLoader } }) => {
		try {
			const loadUser = await UserLoader.load(parent.sub);

			return loadUser.avatar;
		} catch (e) {}

		const payload = await UserModel.findOne({ $or: [{ sub: parent.sub }, { _id: mongoose.Types.ObjectId(parent.id) }] });

		return payload.avatar;
	},
	username: async (parent, _, { req, loaders: { UserLoader } }) => {
		try {
			const loadUser = await UserLoader.load(parent.sub);

			return loadUser.username;
		} catch (e) {}

		const payload = await UserModel.findOne({ $or: [{ sub: parent.sub }, { _id: mongoose.Types.ObjectId(parent.id) }] });

		return payload.username;
	},
};
