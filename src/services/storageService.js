const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid');
const path = require('path');

//TODO: Add the storage json key to gitignore
// Instantiate a storage client
const storage = new Storage({
	keyFilename: path.join(__dirname, '../../google_cloud/storage_service_key.json'),
});

// storage bucket name
const bucketName = 'proximity_storage';
const bucket = storage.bucket(bucketName);

exports.uploadFileToGCS = async (file) => {
	const fileName = `${uuid.v4()}${file.name}`;
	const storagePath = `images/stores/${fileName}`;
	const blob = bucket.file(storagePath);
	const blobStream = blob.createWriteStream({
		resumable: false,
	});

	return new Promise((resolve, reject) => {
		blobStream.on('finish', () => {
			// const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
			resolve(storagePath);
		});

		blobStream.on('error', (err) => {
			reject(err);
		});

		blobStream.end(file.data);
	});
};
