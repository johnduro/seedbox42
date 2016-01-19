#Seedbox Teurpi Torrent
 

##What's this ?


**Teurpi Torrent** allows you to turn a server into a **seedbox** easily.

Providing a **nice web interface** for Transmission to manage several users, torrents, download files easily and even stream your content.

This tutorial is aimed at beginners.

### What you need to do :

**Setting up a debian** : https://jtreminio.com/2012/07/setting-up-a-debian-vm-step-by-step/

**Download a Debian** http://ftp.cae.tntech.edu/debian-cd/ amd64 i386

###Secure the server :


**install sudo** : 	

	apt-get install sudo

**create a user named admin** : 

	adduser admin

**give this user a password** : 

	passwd admin

**add “sudo” rights for the user** : 

	echo 'admin ALL=(ALL) ALL' >> /etc/sudoers

**edit ssh file in order to prevent a root connection** : 

	nano /etc/ssh/sshd_config

**Find the line “#PermitRootLogin”** and change the value “Yes” or “without-password”, by “no”.

Ctrl+x to exit. Answer *yes* to save, and press *enter* to keep the name.

Connect to your server with the new user.

###Install git 

**install git** : 

	sudo apt-get install git

###Install nodejs and npm


**install curl** : 

	sudo apt-get install curl

**install nodejs** : 

	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash then sudo apt-get install -y nodejs

**nodejs -v** should give you a 5.something version

###Install mongodb

**Following the instructions here** : https://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian/

**Therefore you must do :** 
	
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com --recv EA312927

	echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	sudo apt-get update

	sudo apt-get install -y mongodb-org 
	
if it doesn’t work, there’s a good chance you forgot the update part

By using the command **mongo**, you open a console, you can enter the following commands in order to check the 
version :

	> version()
	3.2.0
	> db.version()
	3.2.0
	
then ctrl+c to exit

###Install transmission

Do a 
	
	sudo apt-get install transmission-cli transmission-common transmission-daemon
To launch the process

	 transmission-daemon
Note that you can **stop the service** with 

	sudo service transmission-daemon stop
But for now, let it open and started

Check with 

	transmission-remote -l
If there’s no authentification error, you can skip the following.

If auth error, stop the service 

	sudo service transmission-daemon stop

Edit the file with 

	sudo nano /etc/transmission-daemon/settings.json

Find the line **rpc-authentication-required: true** and modify **true** into **false**

Check again : 

	sudo /etc/init.d/transmission-daemon restart and sudo /etc/init.d/transmission-daemon start


###Install npm

npm is already installed thanks to nodejs

Use 
		
		git clone https://github.com/johnduro/seedbox42.git
But you need to install all dependancies with 

	cd seedbox42
	sudo npm install 
If it doesn’t work, it can be an error linked to make, gyp or bcrypt, you should follow the following part :

Beforehand, you need to make sure that make is installed : 

	sudo apt-get install make
Then gyp  

	npm install -g npm && sudo apt-get install g++ gyp
And sudo 

	npm i -g node-gyp && sudo node-gyp clean
If it’s not working, 
	
	sudo npm install bcrypt.
Lastly,  
	
	sudo npm install again

###Install Teurpi Torrent

Doing 

	node bin/www
should turn the server on.

###How to use ttManager.

ttManager is a tool to configure your serv easily and fast, you can launch it with 

	node ttManager.js (--option).

The following command give you all the options 

	node ttManager.js --help

In order to start, you need to generate the default configuration file, using the option

	--generate-conf
	
Remember to not forget the sudo if you want to create a new file. If you try to add an already existing user, mongo should gives you an error.

The following option allow you to add a new user to the database (password must at least contain 5 characters).

	--create-user 

 The following option allow you to edit the informations (name, pass etc.) of an existing user.

	--modify-user

###How to launch the server as a daemon process

It is used in order to leave the ssh connection without stopping the server.

First you need to install forever : 

	sudo npm install forever -g

Then, at the seedbox directory : 

	npm install forever-monitor

Now, to start your server :

	forever start bin/www

Some others useful commands : 
stop the server 

	forever stop bin/www
listing launched process 

	forever list

###If you already have a transmission server and some files.


Using ttManager.js,

	node ttManager.js --generate-conf 
to generate the new config file.

use 

	node ttManager.js --transmission-to-conf
to translate your transmission file 
to the new config.

Then 
	
	node ttManager.js --add-existing-torrents
to add current existings torrents into the db.

And 
	
	node ttManager.js  --add-directory /path/to/directory
to add the files to the db.

####Recommanded Treeview for a teurpittorrent user :

**/home/teurpitorrent/app** : git clone of the app

**/home/teurpitorrent/ttFiles/complete** : completed files directory

**/home/teurpitorrent/ttFiles/incomplete** : temporary files directory

_______________

#Seedbox Teurpi Torrent
 

##Qu'est ce que c'est ?


**Teurpi Torrent** vous permet de transformer votre serveur en **seedbox** facilement.

Avec l'aide d'une **jolie interface web** pour Transmission, il permet de gérer plusieurs utilisateurs, torrents, de télécharger simplement des fichiers et même de streamer votre contenu.

Ce tutorial est destiné à des débutants.

### Que dois-je faire :

**Mettre en place un serveur debian** : https://jtreminio.com/2012/07/setting-up-a-debian-vm-step-by-step/

**Télécharger l'image Debian** http://ftp.cae.tntech.edu/debian-cd/ amd64 i386

###Sécuriser le serveur :


**installer sudo** : 	

	apt-get install sudo

**créer un utilisateur admin** : 

	adduser admin

**donner à cet utilisateur un password** : 

	passwd admin

**ajouter les droits “sudo” pour l'utilisateur** : 

	echo 'admin ALL=(ALL) ALL' >> /etc/sudoers

**editer le fichier sshpour empêcher une connection en root** : 

	nano /etc/ssh/sshd_config

**Trouver la ligne “#PermitRootLogin”** et changer la valeur “Yes” ou “without-password”, en “no”.

Ctrl+x pour quitter. Répondre *yes* pour sauvegarder, et appuyer sur *enter* pour garder le nom.

Se connecter au serveur avec le nouvel utilisateur.

###Installer git 

**installer git** : 

	sudo apt-get install git

###Installer nodejs and npm


**installer curl** : 

	sudo apt-get install curl

**installer nodejs** : 

	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash then sudo apt-get install -y nodejs

**nodejs -v** should give you a 5.something version.

###Installer mongodb

**Suivre les instructions ici** : https://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian/

**C'est à dire faire:** 
	
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com --recv EA312927

	echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	sudo apt-get update

	sudo apt-get install -y mongodb-org 
	
Si cela ne fonctionne pas, vous avez probablement oublié d'update.

En utilisant la commande **mongo**, on ouvre une console, on peut alors rentrer les commandes suivantes pour vérifier la version :

	> version()
	3.2.0
	> db.version()
	3.2.0
	
puis ctrl+c pour sortir

###Installer transmission

Faire
	
	sudo apt-get install transmission-cli transmission-common transmission-daemon
Pour lancer le processus

	 transmission-daemon
A noter que l'on peut **stopper le service** avec 

	sudo service transmission-daemon stop
Pour le moment, on le laisse tourner

Vérifier avec

	transmission-remote -l
s'il n'y a pas d'erreur d'authentification, vous pouvez zapper la suite.

Si erreur d'auth, on stoppe le service 

	sudo service transmission-daemon stop

On édite le fichier avec

	sudo nano /etc/transmission-daemon/settings.json

On trouve la ligne **rpc-authentication-required: true** et on modifie **true** par **false**

On vérifie encore : 

	sudo /etc/init.d/transmission-daemon restart and sudo /etc/init.d/transmission-daemon start


###Installer npm

npm est déja installé via nodejs

On utilise
		
		git clone https://github.com/johnduro/seedbox42.git
Mais on doit aussi installer les dépendances avec 

	cd seedbox42
	sudo npm install 
Si cela ne fonctionne pas, l'erreur peut être liée à make, gyp ou bcrypt, il faut suivre la partie suivante :

Tout d'abord, on s'assure que make est installé : 

	sudo apt-get install make
Puis gyp  

	npm install -g npm && sudo apt-get install g++ gyp
Et enfin sudo 

	npm i -g node-gyp && sudo node-gyp clean
Si cela ne marche pas,
	
	sudo npm install bcrypt.
Enfin,
	
	sudo npm install again

###Installer Teurpi Torrent

Faire 

	node bin/www
devrait lancer le serveur.

###Comment utiliser ttManager.

ttManager est un outil pour configurer son serveur facilement et rapidement, vous pouvez le lancer via la commande

	node ttManager.js (--option).

La commande suivante vous présente les diverses options

	node ttManager.js --help

De base, vous allez devoir générer un fichier de configuration par défaut avec l’option

	--generate-conf
	
Ici, n’oubliez pas le sudo avant puisqu’il a besoin de créer un fichier. Si vous tentez d’ajouter un utilisateur dont le nom est deja rentré, mongo devrait renvoyer une erreur.

L'option suivante vous permet d’ajouter un utilisateur à votre seedbox. Le mot de passe doit faire plus de 5 lettres). 

	--create-user 

L'option suivante vous permet de modifier les informations d'un utilisateur existant.

	--modify-user

###Pour lancer le serveur en daemon.

C'est ce qui permet de quitter la session ssh et de garder le serveur lancé.

Installer forever : 

	sudo npm install forever -g

Puis dans le répertoire seedbox : 

	npm install forever-monitor

Démarrez le serveur :

	forever start bin/www

Quelques commandes utiles : 
Stopper le serveur 

	forever stop bin/www
Lister les processus lancés 

	forever list

###Si le serveur transmission est deja existant et que vous avez quelques fichiers.


Utiliser ttManager.js,

	node ttManager.js --generate-conf 
pour générer les nouveaux fichiers de configuration.

puis

	node ttManager.js --transmission-to-conf
récupèrera les options de transmission.

suivi de 
	
	node ttManager.js --add-existing-torrents
pour ajouter les torrents en cours à la db.

Et enfin 
	
	node ttManager.js  --add-directory /path/to/directory
ajoutera les fichiers à la db.

####Arborescence des fichiers conseillée avec un utilisateur teurpittorrent :

**/home/teurpitorrent/app** : git clone de l'application

**/home/teurpitorrent/ttFiles/complete** : dossier de fichiers complets

**/home/teurpitorrent/ttFiles/incomplete** : dossier de fichiers incomplets
