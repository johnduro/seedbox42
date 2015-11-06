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

	formatFileList: function (files, user) {
		var result = [];
		files.forEach(function (file) {
			var infos = file.toObject();
			infos.commentsNbr = file.countComments();
			infos.isLocked = file.getIsLocked();
			infos.isLockedByUser = file.getIsLockedByUser(user);
			infos.averageGrade = file.getAverageGrade();
			delete infos.comments;
			delete infos.locked;
			delete infos.grades;
			result.push(infos);
		});
		return result;
	},

	formatCommentList: function (comments, done) {
		var formattedComments = [];
		var i = 0;
		(function loop () {
			var comment = comments[i++];
			if (!comment)
				return done(null, formattedComments);
			User.getByIdFormatShow(comment.user, function (err, user) {
				if (err)
					return done(err);
				var formatComment = comment.toObject();
				formatComment.user = user;
				formattedComments.push(formatComment);
				loop();
			});
		})();
	},

	formatMessageList: function (messages, done) {
		var formattedMessages = [];
		var i = 0;
		(function loop () {
			var message = messages[i++];
			if (!message)
				return done(null, formattedMessages);
			User.getByIdFormatShow(message.user, function (err, user) {
				if (err)
					return done(err);
				var formatMessage = message.toObject();
				formatMessage.user = user;
				formattedMessages.push(formatMessage);
				loop();
			});
		})();
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

	jsonToFile: function (file, json, cb) {
		var jsonFormat = JSON.stringify(json, null, 4);
		fs.writeFile(file, jsonFormat, function (err) {
			if (err)
				cb(err);
			else
				cb(null);
				// console.log("ERR WRITE FILE > ", err); //mettre un callback qui remonte l erreure
		});
	}
};
