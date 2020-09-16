var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var unzip = require('unzip');
var crypto = require('crypto');

var WIX_BINARY_URL = 'http://static.wixtoolset.org/releases/v3.9.1006.0/wix39-binaries.zip'
var zip_hash = '0f05d338d364b348d20c1ccb79f6103cc5209417382ce1e705ce436ea85fb46f0bc32b75d5f5de9ad62bbda5b2d93ff9f1497370e918d5ef0c3fa12d60308ca1';

var zipPath = path.resolve(os.tmpdir(), 'wix.zip');
var file = fs.createWriteStream(zipPath);
var request = http.get(WIX_BINARY_URL, function(response) {
	response.pipe(file);
	console.log('Downloading WIX Binaries');
	response.on('data', function() {
		process.stdout.write(".");
	});
	response.on('end', function() {
		console.log('Download complete');
		console.log('Starting integrity check...');

		// Verify file using hash make MITM harder
		var fstream = fs.createReadStream(zipPath);
		var hash = crypto.createHash('sha512');
		hash.setEncoding('hex');

		fstream.on('end', function() {
			hash.end();
			calculated_hash = hash.read();
			if (zip_hash === calculated_hash){
				console.log('Extracting');
				fs.createReadStream(zipPath).pipe(unzip.Extract({path: path.resolve(__dirname, 'wix-bin')}));
				console.log("Extraction complete")
			}else{
				console.error(`File verification failed:\nDownloaded file sha512: ${calculated_hash}`);
				fs.unlink(zipPath, function(err) {
					if (err) throw err;
					console.log('File deleted');
					process.exit(-1);
				});
			}
		});
		fstream.pipe(hash);
	})
});

