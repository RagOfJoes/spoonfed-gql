const { Issuer, custom } = require('openid-client');

function getClient(settings) {
	let client;

	const clientSettings = settings.oidcClient || {
		httpTimeout: 2500,
	};

	return async function () {
		if (client) {
			return client;
		}

		const issuer = await Issuer.discover(settings.issuer);
		client = new issuer.Client({
			response_types: ['code'],
			client_id: settings.clientId,
			client_secret: settings.clientSecret,
			redirect_uris: [settings.redirectUri],
		});

		if (clientSettings.httpTimeout) {
			const timeout = clientSettings.httpTimeout;
			client[custom.http_options] = function setHttpOptions(options) {
				return {
					...options,
					timeout,
				};
			};
		}

		if (clientSettings.clockTolerance) {
			client[custom.clock_tolerance] = clientSettings.clockTolerance / 1000;
		}

		return client;
	};
}

module.exports = getClient;
