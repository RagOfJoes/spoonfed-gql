const { Client } = require('openid-client');
const { RedisCache } = require('apollo-server-cache-redis');

/**
 *
 * @param {Client} clientProvider
 * @param {RedisCache} cache
 */
function checkToken(clientProvider, cache) {
	return async function (req, _, next) {
		// Return early if no auth header was provided
		if (!req.headers || !req.headers.authorization) {
			return next();
		}

		try {
			// Get Actual Token
			const authHeader = req.headers.authorization.split(' ');
			const tokenType = authHeader[0];
			const tokenValue = authHeader[1];

			// Make sure auth token was a Bearer token
			if (tokenType !== 'Bearer') return next();

			if (!tokenValue) return next();

			// First check cache
			const cacheKey = 'accessToken:' + tokenValue + ':user';
			const cachedToken = await cache.get(cacheKey);
			if (cachedToken) {
				const cachedJson = JSON.parse(cachedToken);
				// Pass User to Context for resolvers
				req.user = { ...cachedJson };
				return next();
			}

			// If not in the cache then check the token and get user info
			const client = await clientProvider();
			const promOne = client.userinfo(tokenValue, { tokenType });
			const promtTwo = client.introspect(tokenValue, tokenType);
			const [user, introToken] = await Promise.all([promOne, promtTwo]);

			// If User is valid && Access Token is still Valid
			if (user && introToken && introToken.active) {
				const { exp, iat, iss, sub, scope } = introToken;
				// If invalid Issuer
				if (iss !== process.env.ISSUER_ROOT) return next();

				// Should never ever happen
				if (sub !== user.sub) return next();

				const today = Math.floor(new Date().getTime() / 1000);
				const oneHourFromNow = today - 1000 * 60 * 60 * 1;
				// If dates are incorrect or exp have passed
				if (iat > today || exp < today) {
					return next();
				}

				// If profile was requested then just pass profile and remove extra sub value
				if (user.profile) delete user.sub;

				const cacheValue = user.profile ? user.profile : user;
				cacheValue.scope = scope;

				if (user.email) cacheValue.email = user.email;
				// If token still has two hours to live then set to cache
				if (exp > oneHourFromNow)
					await cache.set(cacheKey, JSON.stringify(cacheValue), 'EX', 60 * 10 /** 10 min in seconds */);
				// < 2 then just set to cache with TTL to the remainder of its lifetime
				else await cache.set(cacheKey, JSON.stringify(cacheValue), 'EX', exp - today /** Remainder of TTL */);
				req.user = { ...cacheValue, scope: scope };
			}
		} catch (e) {}
		next();
	};
}

module.exports = checkToken;
