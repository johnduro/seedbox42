// var File = require('../models/File.js');
var mongoose = require('mongoose');
// var File = mongoose.model('File');
var User = require('../models/User.js');
var fs = require('fs');


module.exports = {
	indexOfByIdKey: function (arr, key, value) {
		var arrayLength = arr.length;
		for (var i = 0; i < arrayLength; i++) {
			if (arr[i][key].toString() === value)
				return i;
		}
		return -1;
	},

	updateSettings: function (newSettings, oldSettings) {
		console.log("BEFORE > ", oldSettings);
		for (var key in newSettings)
		{
			if (oldSettings.hasOwnProperty(key) && oldSettings[key] != newSettings[key])
				oldSettings[key] = newSettings[key];
		}
		console.log("AFTER > ", oldSettings);
		return oldSettings;
	},

	jsonToFile: function (file, json, done) {
		var jsonFormat = JSON.stringify(json, null, 4);
		fs.writeFile(file, jsonFormat, function (err) {
			if (err)
				done(err);
			else
				done(null);
		});
	},

	checkExistentFiles: function (files, done) {
		var i = 0;
		var result = [];
		(function next () {
			var addFile = files[i++];
			if (!addFile)
				return done(null, result);
			mongoose.model('File').findOne({ path: addFile.path }, function (err, file) {
				if (err)
					return done(err);
				if (file == null)
					result.push(addFile);
				next();
			});
		})();
	}
};
