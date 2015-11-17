/**
 * ajout d'un dossier de film deja present (+ path)
 * verification de la conformite de la bdd
 * verification de la conformite du fichier de config
 * mise a jour du fichier de config depuis transmission
 * mise a jour de transmission depuis le fichier de config
 * generation du fichier de config
 * ????
 *
 */
var fs = require('fs');
var mini = require('minimist');
var chalk = require('chalk');
var validity = require('./config/validity');

var miniOpt = {
	string: ['add-directory'],
	boolean: ['check-database', 'check-conf-file', 'transmission-to-conf', 'conf-to-transmission', 'generate-conf']
};

var original = mini(process.argv.slice(2));
var argv = mini(process.argv.slice(2), miniOpt);
console.log('1> ', argv);
console.log('og> ', original);

if (argv['check-conf-file'])
{
	var configFileName = './config.json';
	fs.readFile(configFileName, 'utf8', function (err, data) {
		if (err)
		{
			if (err.code == 'ENOENT')
			{
				console.log(chalk.yellow('The file ' + configFileName + ' does not exist\n') + chalk.green('Use --generate-conf to create a new configuration file'));
			}
			else if (err.code == 'EACCES')
			{
				console.log(chalk.yellow('You does not have right to access "' + configFileName + '"\n') + chalk.green('Please change rights to grant access to the file'));
			}
		}
		else
		{
			var config = JSON.parse(data);
			var configDefault = JSON.parse(fs.readFileSync('./config/default-config.json', 'utf8'));
			var valErr = validity.checkConfig(config, configDefault, '', configFileName);
			validity.checkConfigErrors(valErr, configFileName);
		}
	});
}
