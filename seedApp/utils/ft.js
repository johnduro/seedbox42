
var User = require('../models/User.js');

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
			User.findById(comment.user, function (err, user) {
				if (err)
					return done(err);
				var temp = comment.toObject();
				temp.user = user.login;
				formattedComments.push(temp);
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
			User.findById(message.user, { login: 1, avatar: 1, role: 1 }, function (err, user) {
				if (err)
					return done(err);
				var temp = message.toObject();
				temp.user = user.toObject();
				formattedMessages.push(temp);
				loop();
			});
		})();
	}
};
