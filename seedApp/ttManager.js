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
var configUtils = require('./config/utils');

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
	//check config file exist
	var configFileName = './config.json';
	var config = JSON.parse(fs.readFileSync(configFileName, 'utf8'));
	var configDefault = JSON.parse(fs.readFileSync('./config/default-config.json', 'utf8'));
	var err = configUtils.checkConfigValidity(config, configDefault, '', configFileName);
	configUtils.checkConfigValidityErrors(err, configFileName);
}
