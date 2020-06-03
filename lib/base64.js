function encode(str, encoding) {
	return Buffer.from(str, encoding || 'utf8').toString('base64');
}

function decode(str, encoding) {
	return Buffer.from(str, 'base64').toString(encoding || 'utf8');
}

module.exports = { encode, decode };
