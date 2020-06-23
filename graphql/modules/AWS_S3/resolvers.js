const AWS = require('aws-sdk');
const { authenticated } = require('../../authResolvers');

// TODO: Make sure User is authenticated when uploading
module.exports = {
	Mutation: {
		signS3Single: authenticated(async (_, { file: { filename, filetype } }, {}) => {
			const s3 = new AWS.S3({
				region: 'us-west-1',
				signatureVersion: 'v4',
				accessKeyId: process.env.AWS_KEY_ID,
				secretAccessKey: process.env.AWS_KEY_SECRET,
			});

			const params = {
				Expires: 60,
				Key: filename,
				ACL: 'public-read',
				ContentType: filetype,
				CacheControl: 'max-age=1945975',
				Bucket: process.env.AWS_S3_BUCKET,
			};
			const signedUrl = await s3.getSignedUrlPromise('putObject', params);
			const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${filename}`;

			return {
				signedUrl,
				fileUrl,
			};
		}),
		signS3Multiple: authenticated(async (_, { files }, {}) => {
			if (!files.length || files.length <= 0) throw new Error('Must Provide atleast one file!');

			const s3 = new AWS.S3({
				region: 'us-west-1',
				signatureVersion: 'v4',
				accessKeyId: process.env.AWS_KEY_ID,
				secretAccessKey: process.env.AWS_KEY_SECRET,
			});

			try {
				// Array of promises
				const promises = files.map(async (file) => {
					const { filename, filetype } = file;

					const params = {
						Expires: 60,
						Key: filename,
						ACL: 'public-read',
						ContentType: filetype,
						CacheControl: 'max-age=1945975',
						Bucket: process.env.AWS_S3_BUCKET,
					};
					const signedUrl = await s3.getSignedUrlPromise('putObject', params);
					const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${filename}`;

					return { signedUrl, fileUrl };
				});

				// Wait until all promises are resolved
				const payload = await Promise.all(promises);

				// Then return array of urls
				return payload;
			} catch (e) {
				if (process.env.NODE_ENV === 'development') {
					console.log(e);
				}
			}

			return null;
		}),
	},
};
