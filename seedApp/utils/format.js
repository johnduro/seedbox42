var chalk = require('chalk');
var User = require('../models/User');
var ft = require('../utils/ft');

module.exports = {
	fileList: function (files, user) {
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

	commentList: function (comments, done) {
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

	wallMessageList: function (messages, done) {
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

	torrentsIds: function (ids) {
		var ret = [];
		if (typeof ids == 'string' || typeof ids == 'number')
			ids = [ids];
		ids.forEach(function (id) {
			ret.push(parseInt(id, 10));
		});
		return (ret);
	},

	managerAddDirectory: function (files) {
		var sizeMax = 0;
		var pathMax = 0;
		var typeMax = 0;
		var filesObj = {};
		var choices = [];
		var writeWarning = "You may not have the right to write/delete this file";
		var readWarning = "You may not have the right to read this file";
		files.forEach(function (file) {
			file.sizeStr = ft.convertSize(file.size);
			sizeMax = ( file.sizeStr.length > sizeMax ) ? file.sizeStr.length : sizeMax;
			pathMax = ( file.path.length > pathMax ) ? file.path.length : pathMax;
			typeMax = ( file.fileType.length > typeMax ) ? file.fileType.length : typeMax;
		});
		files.forEach(function (file) {
			var name = "";
			name += file.path + (' '.repeat(pathMax - file.path.length));
			name += ' - ' + file.sizeStr + (' '.repeat(sizeMax - file.sizeStr.length));
			name += ' - ' + file.fileType + (' '.repeat(typeMax - file.fileType.length));
			if (file.rights.write == false)
				name += (' - ' + chalk.yellow(writeWarning));
			if (file.rights.read == false)
				name += (' - ' + chalk.red(readWarning));
			choices.push({ name: name });
			filesObj[name] = file;
		});
		return ({ choices: choices, filesObj: filesObj });
	}
};
