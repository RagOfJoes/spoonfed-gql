const { AuthenticationError } = require('apollo-server-express');

/**
 * Base Resolver to check if User is Authenticated
 * @param {Function} next - Next Middle Function
 */
const authenticated = (next) => (root, args, context, info) => {
	if (!context || !context.req.user) throw new AuthenticationError('You must be authenticated to access this resource');

	return next(root, args, context, info);
};

module.exports = { authenticated };
