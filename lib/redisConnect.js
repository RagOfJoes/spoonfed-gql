const { RedisCache } = require('apollo-server-cache-redis');

module.exports = async () => {
	const cache = new RedisCache({
		port: process.env.REDIS_PORT,
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PW,
		enableReadyCheck: true,
	});

	cache.client.on('ready', function () {
		console.log('Redis ready!');
	});

	return { cache };
};
