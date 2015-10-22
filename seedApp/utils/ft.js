

module.exports = {
	indexOfByKey: function (arr, key, value) {
		var arrayLength = arr.length;
		for (var i = 0; i < arrayLength; i++) {
			if (arr[i][key] === value)
				return i;
		}
		return -1;
	},

	formatFileList: function (files) {
		var result = [];
		files.forEach(function (file) {
			var infos = file.toObject();
			infos.commentsNbr = file.countComments();
			infos.isLocked = file.getIsLocked();
			infos.averageGrade = file.getAverageGrade();
			delete infos.comments;
			delete infos.locked;
			delete infos.grades;
			result.push(infos);
		});
		return result;
	}
};
