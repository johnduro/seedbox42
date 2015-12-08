
var fs = require('fs');
var mongoose = require('mongoose');
var chalk = require('chalk');
var TransmissionNode = require('../transmission/transmissionNode');
var User = require('../models/User');

var Arguments = module.exports = function (configFileName, argvOg, argvParsed) {
	this.args = {
		config: null,
		mongo: null,
		transmission: null,
		user: null
	};
	var self = this;
	this.initArguments = {
		config: function (done) {
			try {
				var data = fs.readFileSync(configFileName, 'utf8');
				var config = JSON.parse(data);
				return done(config);
			} catch (e) {
				if (e.code == 'ENOENT')
				{
					console.log(chalk.yellow('The file ' + configFileName + ' does not exist\n') + chalk.green('Use --generate-conf to create a new configuration file'));
					process.exit();
				}
				else if (e.code == 'EACCES')
				{
					console.log(chalk.yellow('You does not have right to access "' + configFileName + '"\n') + chalk.green('Please change rights to grant access to the file'));
					process.exit();
				}
				return done(null);
			}
		},

		mongo: function (done) {
			var getConnect = function (mongoConf) {
				mongoose.connection.on('error', function (err) {
					console.log(chalk.red("Could not connect to database, please check your configuration file or your database"));
					process.exit();
				});
				var ret = mongoose.connect("mongodb://" + mongoConf.address + '/' + mongoConf.name);
				return (ret);
			};
			if (self.args['config'] === null)
			{
				self.initArguments.config(function (config) {
					self.args.config = config;
					var ret = getConnect(self.args['config'].mongodb);
					return done(ret);
				});
			}
			else
			{
				var ret = getConnect(self.args['config'].mongodb);
				return done(ret);
			}
		},

		transmission: function (done) {
			var transmission = null;
			if (self.args['config'] === null)
			{
				Arguments.initArguments.config(function (config) {
					self.args.config = config;
					transmission = new TransmissionNode(config.transmission);
					return done(transmission);
				});
			}
			else
			{
				transmission = new TransmissionNode(this.args.config.transmission);
				return done(transmission);
			}
		},

		user: function (done) {
			var userQuery = function (cb) {
				var query = {};
				if (argvOg['user'] && argvParsed['user'] != '')
					query.login = argvParsed['user'];
				else
					query.role = 0;
				User.findOne(query).sort({ createdAt: -1 }).exec( function (err, user) {
					if (err)
					{
						console.log(chalk.red("There was an error retreiving the user, please check your database configuration"));
						process.exit();
					}
					else if (user == null)
					{
						console.log(chalk.red('No admin in database, please create one using "--create-user" command'));
						process.exit();
					}
					else
						cb(user);
				});
			};
			if (self.args['mongo'] === null)
			{
				self.initArguments.mongo(function (mongo) {
					self.args.mongo = mongo;
					userQuery(function (user) {
						done(user);
					});
				});
			}
			else
			{
				userQuery(function (user) {
					done(user);
				});
			}
		}
	};
};

Arguments.prototype.getArgument = function (arg, done) {
	var self = this;
	if (this.args[arg] === null)
	{
		this.initArguments[arg](function (ret) {
			self.args[arg] = ret;
			return done(self.args[arg]);
		});
	}
	else
		return done(this.args[arg]);
};
