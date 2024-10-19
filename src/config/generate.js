

export default {
	configFromDefault: function self (defaultConfig) {
		var newConfig = {};
		for (var key in defaultConfig)
		{
			if (typeof defaultConfig[key] == 'object' && defaultConfig[key].hasOwnProperty('type'))
				newConfig[key] = defaultConfig[key].default;
			else
				newConfig[key] = self(defaultConfig[key]);
		}
		return newConfig;
	}
};
