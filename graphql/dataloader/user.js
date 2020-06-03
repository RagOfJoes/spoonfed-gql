const DataLoader = require('dataloader');
const UserModel = require('../../db/User');

/**
 *
 * @param {Array} ids
 */
const batchUsers = async (ids) => {
	const users = await UserModel.find({ sub: { $in: ids } }).lean();

	const mapUsers = {};
	users.map((user) => {
		const { sub } = user;

		if (mapUsers[sub]) return;

		mapUsers[sub] = user;
	});

	return ids.map((id) => mapUsers[id]);
};

const UserLoader = () => new DataLoader(batchUsers);

module.exports = { UserLoader };
