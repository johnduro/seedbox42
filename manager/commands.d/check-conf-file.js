var configDefault = require('../../config/default-config');
var validity = require('../../config/validity');

module.exports = function (configFileName, args, commandLineArg, done) {
	var valErr = validity.checkConfig(args.config, configDefault, '', configFileName);
	validity.checkConfigErrors(valErr, configFileName);
	return done();
};
