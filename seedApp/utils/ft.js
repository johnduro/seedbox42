

module.exports = {
	indexOfByKey: function (arr, key, value) {
		var arrayLength = arr.length;
		for (var i = 0; i < arrayLength; i++) {
			if (arr[i][key] === value)
				return i;
		}
		return -1;
	}
};
