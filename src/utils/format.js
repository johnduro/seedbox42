import chalk from 'chalk';
import User from '../models/User.js';
import ft from '../utils/ft.js';

export default {
	fileList: function (files, user) {
		var result = [];
		files.forEach(function (file) {
			var infos = file.toObject();
			infos.isLocked = file.getIsLocked();
			infos.isLockedByUser = file.getIsLockedByUser(user);
			delete infos.locked;
			result.push(infos);
		});
		return result;
	},

	commentList: async function (comments) {
		try {
			const formattedComments = await Promise.all(comments.map(async (comment) => {
				const formattedComment = comment.toObject();

				const user = await User.getByIdFormatShow(comment.user);
				formattedComment.user = user;
				return formattedComment;
			}));
			return formattedComments;
		} catch (err) {
			throw new Error(`Error formatting comment list: ${err.message}`);
		}
	},

	wallMessageList: async function (messages) {
		try {
			const formattedMessages = [];

			for (const message of messages) {
				const user = await User.getByIdFormatShow(message.user);
				const formatMessage = message.toObject();
				formatMessage.user = user;
				formattedMessages.push(formatMessage);
			}

			return formattedMessages;
		} catch (err) {
			throw new Error('Could not format messages: ' + err.message);
		}
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
			sizeMax = (file.sizeStr.length > sizeMax) ? file.sizeStr.length : sizeMax;
			pathMax = (file.path.length > pathMax) ? file.path.length : pathMax;
			typeMax = (file.fileType.length > typeMax) ? file.fileType.length : typeMax;
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
