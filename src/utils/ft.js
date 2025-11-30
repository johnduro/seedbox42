import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';


export default {
	indexOfByIdKey: function (arr, key, value) {
		var arrayLength = arr.length;
		for (var i = 0; i < arrayLength; i++) {
			if (arr[i][key].toString() == value)
				return i;
		}
		return -1;
	},

	indexOfByUserId: function (arr, userId) {
		var arrayLength = arr.length;
		for (var i = 0; i < arrayLength; i++) {
			if (arr[i].user != null && arr[i].user._id.toString() == userId)
				return (i);
		}
		return (-1);
	},

	updateSettings: function (newSettings, oldSettings) {
		for (var key in newSettings) {
			if (oldSettings.hasOwnProperty(key) && oldSettings[key] != newSettings[key])
				oldSettings[key] = newSettings[key];
		}
		return oldSettings;
	},

	jsonToFile: function (file, json) {
		return new Promise((resolve, reject) => {
			const jsonFormat = JSON.stringify(json, null, 4);
			fs.writeFile(file, jsonFormat, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	},

	checkExistentFiles: async (files) => {
		const result = [];
		for (const addFile of files) {
			try {
				const file = await mongoose.model('File').findOne({ path: addFile.path }).exec();
				if (file == null) {
					result.push(addFile);
				}
			} catch (err) {
				throw new Error(`Error checking file: ${err.message}`);
			}
		}
		return result;
	},

	convertSize: function (aSize) {
		if (aSize <= 0)
			return "0 octets";
		aSize = Math.abs(parseInt(aSize, 10));
		var def = [[1, 'octets'], [1024, 'ko'], [1024 * 1024, 'Mo'], [1024 * 1024 * 1024, 'Go'], [1024 * 1024 * 1024 * 1024, 'To']];
		for (var i = 0; i < def.length; i++) {
			if (aSize < def[i][0])
				return (aSize / def[i - 1][0]).toFixed(2) + ' ' + def[i - 1][1];
		}
	},

	getUserPwHash: function (password) {
		const saltRounds = 10;

		return new Promise((resolve, reject) => {
			bcrypt.genSalt(saltRounds, function (err, salt) {
				if (err) {
					return reject('An error occurred while generating salt');
				}
				bcrypt.hash(password, salt, function (err, hash) {
					if (err) {
						return reject('An error occurred while generating hash');
					} else {
						return resolve(hash);
					}
				});
			});
		});
	},

	getRange: function (size, str) {
		var valid = true;
		var i = str.indexOf('=');

		if (-1 == i) return -2;

		var arr = str.slice(i + 1).split(',').map(function (range) {
			var range = range.split('-')
				, start = parseInt(range[0], 10)
				, end = parseInt(range[1], 10);

			// -nnn
			if (isNaN(start)) {
				start = size - end;
				end = size - 1;
				// nnn-
			} else if (isNaN(end)) {
				end = size - 1;
			}

			// limit last-byte-pos to current length
			if (end > size - 1) end = size - 1;

			// invalid
			if (isNaN(start)
				|| isNaN(end)
				|| start > end
				|| start < 0) valid = false;

			return {
				start: start,
				end: end
			};
		});

		arr.type = str.slice(0, i);

		return valid ? arr : -1;
	}

};
