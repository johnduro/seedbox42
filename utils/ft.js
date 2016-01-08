// var File = require('../models/File.js');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
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

	indexOfByUserId: function (arr, userId) {
		var arrayLength = arr.length;
		for (var i = 0; i < arrayLength; i++)
		{
			if (arr[i].user != null && arr[i].user._id.toString() == userId)
				return (i);
		}
		return (-1);
	},

	updateSettings: function (newSettings, oldSettings) {
		for (var key in newSettings)
		{
			if (oldSettings.hasOwnProperty(key) && oldSettings[key] != newSettings[key])
				oldSettings[key] = newSettings[key];
		}
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
	},

	convertSize: function (aSize) {
		if (aSize <= 0)
			return "0 octets";
		aSize = Math.abs(parseInt(aSize, 10));
		var def = [[1, 'octets'], [1024, 'ko'], [1024 * 1024, 'Mo'], [1024 * 1024 * 1024, 'Go'], [1024 * 1024 * 1024 * 1024, 'To']];
		for (var i = 0; i < def.length; i++)
		{
			if (aSize < def[i][0])
				return (aSize / def[i - 1][0]).toFixed(2) + ' ' + def[i - 1][1];
		}
	},

	getUserPwHash: function (password, done) {
		bcrypt.genSalt(10, function(err, salt) {
			if (err)
				return done('An error occured while generating salt');
			bcrypt.hash(password, salt, function(err, hash) {
				if (err)
					return done('An error occured while generating hash');
				else
					return done(null, hash);
			});
		});
	}

};
