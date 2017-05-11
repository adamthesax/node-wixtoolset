var path = require('path');
var child_process = require('child_process');

function wixBinWrapper(exe, requiredArgs) {
	return function(/* arguments */) {
		var args = [], opts = {};
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] === 'string' || typeof arguments[i] === 'number') {
				args.push(arguments[i]);
			} else if (typeof arguments[i] === 'object' && i === arguments.length-1) {
				opts = arguments[i];
			} else {
				throw new Error("Wrong arguments for this command");
			}
		}

		return new Promise(function(resolve, reject) {
			var cmd = path.resolve(__dirname, 'wix-bin', exe),
			    optArgs = createArgsFromOptions(opts);
			
			if (optArgs.length) {
				args = optArgs.concat(args);
			}

			if (process.platform !== "win32") {
				args.unshift(cmd);
				cmd = 'wine';
			}

			var child = child_process.spawn(cmd, args),
			    stdout = "", stderr = "";
			
			child.stdout.on("data", data => { stdout += String(data); });
			child.stderr.on("data", data => { stderr += String(data); });

			child.on('error', reject);
			child.on('close', function(code) {
				if (code === 0) {
					return resolve({ stdout: stdout, stderr: stderr });
				}
				
				var err = new Error('WIX ' + exe + ' exited with code ' + code + (stderr ? "\n" + stderr : ""));
				err.command = cmd;
				err.args = args;
				err.code = code;
				err.stdout = stdout;
				err.stderr = stderr;

				reject(err);
			});
		});
	}
}

function createArgsFromOptions(opts) {
	var args = [];
	
	for (var key in opts) {
		addToArgs(args, key, opts[key]);
	}
	
	return args;
}

function addToArgs(args, key, val) {
	if (typeof val === 'string' || typeof val === 'number') {
		args.push('-' + key, opts[key]);
	} else if (typeof val === 'boolean' && val) {
		args.push('-' + key);
	} else if (Array.isArray(val)) {
		val.forEach(function(v) { addToArgs(args, key, v); });
	}
}

module.exports = {
	candle: wixBinWrapper('candle.exe'),
	dark: wixBinWrapper('dark.exe'),
	heat: wixBinWrapper('heat.exe'),
	insignia: wixBinWrapper('insignia.exe'),
	light: wixBinWrapper('light.exe'),
	lit: wixBinWrapper('lit.exe'),
	lux: wixBinWrapper('lux.exe'),
	melt: wixBinWrapper('melt.exe'),
	nit: wixBinWrapper('nit.exe'),
	pyro: wixBinWrapper('pyro.exe'),
	retina: wixBinWrapper('retina.exe'),
	shine: wixBinWrapper('shine.exe'),
	smoke: wixBinWrapper('smoke.exe'),
	torch: wixBinWrapper('torch.exe')
};
