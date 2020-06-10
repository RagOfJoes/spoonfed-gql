// DEVELOPMENT ONLY
process.env.NODE_ENV !== 'production' && require('dotenv/config');

const http = require('http');
const express = require('express');
const initAuth = require('./oidc');
const modules = require('./graphql/modules');
const cookieParser = require('cookie-parser');
const loaders = require('./graphql/dataloader');
const redisConnect = require('./lib/redisConnect');
const mongoConnect = require('./lib/mongoConnect');
const { ApolloServer } = require('apollo-server-express');

(async () => {
	// Connect to redis
	const redis = await redisConnect();
	const redisCache = redis.cache;

	// Connect to db
	const db = process.env.MONGO_URI;
	await mongoConnect(db);

	/**
	 * initilize Express and apply any required packages
	 */
	const app = express();
	app.use(cookieParser());

	// Initialize OIDC Client handlers
	const authClient = initAuth({
		issuer: process.env.ISSUER,
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		redisCache,
	});

	/**
	 * Checks header for access token
	 */
	app.use('/graphql', async (req, res, next) => await authClient.checkToken(req, res, next));

	const server = new ApolloServer({
		modules: modules,
		cache: redisCache,
		debug: process.env.NODE_ENV === 'development',
		tracing: process.env.NODE_ENV === 'development',
		playground: process.env.NODE_ENV === 'development',
		introspection: process.env.NODE_ENV === 'development',
		// introspection: true,
		engine: {
			// The Graph Manager API key
			apiKey: process.env.APOLLO_API_KEY,
			// A tag for this specific environment (e.g. `development` or `production`).
			// For more information on schema tags/variants, see
			// https://www.apollographql.com/docs/platform/schema-registry/#associating-metrics-with-a-variant
			schemaTag: process.env.NODE_ENV,
		},
		cacheControl: { defaultMaxAge: 60 * 2 }, // 1hr max age for cache,
		// tracing: process.env.NODE_ENV === 'development', // Disable for prod as this is very resource intensive
		// Pass context
		context: ({ req, res, connection }) => ({
			req,
			res,
			loaders,
			redisCache,
			connection,
		}),
	});

	/**
	 * Connect ApolloServer to existing Express Server
	 */
	server.applyMiddleware({ app, path: '/graphql' });

	const httpServer = http.createServer(app);

	const PORT = process.env.PORT;

	httpServer.listen({ port: PORT }, () => console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`));
})().catch(function (e) {
	console.error(e);
	process.exitCode = 1;
});
