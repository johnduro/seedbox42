module.exports =
	{
		'add-directory': {
			type: 'string',
			mandatoryStr: true,
			functionArg: {
				config: null,
				mongo: null,
				user: null
			},
			usage: ' --add-directory /path/to/directory',
			help: 'Let you select files from a directory and add them to the database'
		},
		'check-database': {
			type: 'boolean',
			functionArg: {
				config: null,
				mongo: null
			},
			usage: ' --check-database',
			help: 'Check the database for errors: missing files and rights issue'
		},
		'check-conf-file': {
			type: 'boolean',
			functionArg: {
				config: null
			},
			usage: ' --check-conf-file',
			help: 'Check configuration file for errors'
		},
		'transmission-to-conf': {
			type: 'boolean',
			functionArg: {
				config: null,
				transmission: null
			},
			usage: ' --transmission-to-conf',
			help: 'Get active transmission configuration from the torrent client and set the configuration files with the values'
		},
		'conf-to-transmission': {
			type: 'boolean',
			functionArg: {
				config: null,
				transmission: null
			},
			usage: ' --conf-to-transmission',
			help: 'Set transmission client configuration to the values in your configuration file'
		},
		'generate-conf': {
			type: 'boolean',
			functionArg: {},
			usage: ' --generate-conf',
			help: 'Generate a new configuration file with the default value'
		},
		'add-existing-torrents': {
			type: 'boolean',
			functionArg: {
				config: null,
				mongo: null,
				transmission: null,
				user: null
			},
			usage: ' --add-existing-torrents',
			help: 'Add all torrents from transmission client to the database when they are not already in'
		},
		'create-user': {
			type: 'boolean',
			functionArg: {
				config: null,
				mongo: null
			},
			usage: ' --create-user',
			help: 'Create a user, admin or simple user'
		},
		'update-conf': {
			type: 'boolean',
			functionArg: {
				config: null
			},
			usage: ' --update-conf',
			help: 'Update current configuration file with the default configuration and set the missing keys to the default values'
		},
		'help': {
			type: 'boolean',
			functionArg: {},
			usage: ' --help',
			help: 'Display this help'
		}
	};
