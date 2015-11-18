
var User = require('../models/User');

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
	}
};
