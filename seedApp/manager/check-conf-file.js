var configDefault = require('../config/default-config');
var validity = require('../config/validity');

module.exports = function (configFileName, args) {
	var valErr = validity.checkConfig(args.config, configDefault, '', configFileName);
	validity.checkConfigErrors(valErr, configFileName);
};
