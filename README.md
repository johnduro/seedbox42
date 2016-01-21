#Seedbox Teurpi Torrent.

**Teurpi Torrent** vous permet de transformer votre serveur dédié en **seedbox** facilement.

Teurpi Torrent est un projet réalisé par des étudiants de l'école 42.

Disposant d'une **interface web claire** pour Transmission, il permet une gestion complète des utilisateurs et de leurs accès. Il autorise le téléchargement de torrents, la gestion des fichiers téléchargés ainsi que la possibilité de streamer des médias.

Ce tutorial est destiné à des débutants.

[Tutorial français](#french)<br><br>

**Teurpi Torrent** allows you to turn a dedicated server into a **seedbox** easily.

Teurpi Torrent is a project made by students from 42 school.

Providing a **neat web interface** for Transmission, it allows to manage several users and their access. You can also download torrents files easily, manage your downloaded files and even stream your content.

This tutorial is aimed at beginners.

[English Tutorial](#english)

<br>
##<a name="english"></a>English Tutorial
<br>

### What you need to do :


- [install sudo](#secure)
(how to secure your server)
- [install git](#git)
- [install make](#make)
- [install nodejs](#nodejs)
- [install mongo](#mongodb)
- [install transmission](#transmission)

If you already know what you're doing, feel free to skip until the following part.

- [**INSTALL TEURPI TORRENT SEEDBOX**](#seedbox)

**Setting up a debian** : https://jtreminio.com/2012/07/setting-up-a-debian-vm-step-by-step/

**Download a Debian** http://ftp.cae.tntech.edu/debian-cd/ amd64 i386

<a name="secure"></a>
###Secure the server.

Some basics needed to secure your server a bit. Feel free to go further...

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
	
You can add several others users with sudo rights if you want.

**Find the line “#PermitRootLogin”** and change the value “Yes” or “without-password”, by “no”.

Ctrl+x to exit. Answer *yes* to save, and press *enter* to keep the name.

Connect to your server with the new user.

<a name="git"></a>
###Install git.

**install git** : 

	sudo apt-get install git
<a name="make"></a>
###Install make.

**install make** :

	sudo apt-get install make
	
<a name="nodejs"></a>
###Install nodejs and npm.


**install curl** : 

	sudo apt-get install curl

**install nodejs** : 

	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash 
	sudo apt-get install -y nodejs

**nodejs -v** should give you a 5.something version
<a name="mongodb"></a>
###Install mongodb.

**Following the instructions here** : https://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian/

**Therefore you must do :** 
	
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

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
<a name="transmission"></a>
###Install transmission.

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

	sudo /etc/init.d/transmission-daemon restart 
	sudo /etc/init.d/transmission-daemon start

<a name="seedbox"></a>
###Starting with Teurpi Torrent.

npm is already installed thanks to nodejs

Use 
		
		git clone https://github.com/johnduro/seedbox42.git -o nameofthedirectoryyouwant
		

######Recommanded Treeview for a teurpittorrent user :

If you're a beginner, here's a recommanded treeview.

**/home/teurpitorrent/app** : git clone of the app

**/home/teurpitorrent/ttFiles/complete** : completed files directory

###Install npm dependencies.
But you need to install all dependancies with 

	cd directorynameyouchose
	sudo npm install 
If it doesn’t work, it can be an error linked to make, gyp or bcrypt, you should follow the following part :

Check gyp  

	sudo npm install -g npm && sudo apt-get install g++ gyp
	sudo npm i -g node-gyp && sudo node-gyp clean
If it’s not working, 
	
	sudo npm install bcrypt
Lastly,  
	
	sudo npm install
again


###Using ttManager.

ttManager is a tool to manage your serv easily and fast from the shell, you can launch it with 

	node ttManager.js (--option).

The following command give you all the options 

	node ttManager.js --help

First, you'll **need** to generate the default configuration with the option

	node ttManager.js --generate-conf 
	
You'll have to choose the port you want, a secret to encrypt passwords, your mongo database address, and the name of your database. Then you'll get others questions for transmission (address, port, etc). Note that if you already use transmission, you can keep a blank field for the directory and follow further instructions.

*You can use defaults values, if you installed all things on one server.*

Vous allez **devoir** ajouter un utilisateur avec cette commande afin d'accéder à votre seedbox. Le mot de passe doit faire plus de 5 lettres. 

	node ttManager.js --create-user

Si vous tentez d’ajouter un utilisateur dont le nom est deja rentré, mongo devrait renvoyer une erreur.

The following option allow you to edit the informations (name, pass etc.) of an existing user.

	node ttManager.js --modify-user

#####If you already have a transmission server and some files.

use 

	node ttManager.js --transmission-to-conf
to translate your transmission files to the new config.

Then 
	
	node ttManager.js --add-existing-torrents
to add current existings torrents from transmission to the db.

And 
	
	node ttManager.js  --add-directory /path/to/directory
to add the selected files from a specific directory.


###How to launch the server as a daemon process.

It is used in order to leave the ssh connection without stopping the server.

First you need to install forever : 

	sudo npm install forever -g

Then, at the seedbox directory : 

	npm install forever-monitor

Now, to start your server :

	forever start bin/www --minUptime 1000 --spinSleepTime 1000

Some others useful commands : 
stop the server 

	forever stop bin/www
listing launched process 

	forever list


#####Now you can connect to your server in your browser, by using the server adress followed by the selected port.
<br>
_______________
<br>
#Seedbox Teurpi Torrent.

<br><br>
##<a name="french"></a>Installation française.
<br>

### Que dois-je faire :


- [installer sudo](#secure-fr)
(vous pouvez voir comment securiser votre serveur)
- [installer git](#git-fr)
- [installer make](#make-fr)
- [installer nodejs](#nodejs-fr)
- [installer mongo](#mongodb-fr)
- [installer transmission](#transmission-fr)

Si vous savez déjà ce que vous faites, allez directement à

- [**INSTALLATION DE LA SEEDBOX TEURPI TORRENT**](#seedbox-fr)




**Mettre en place un serveur debian** : https://jtreminio.com/2012/07/setting-up-a-debian-vm-step-by-step/

**Télécharger l'image Debian** http://ftp.cae.tntech.edu/debian-cd/ amd64 i386

<a name="secure-fr"></a>
###Sécuriser le serveur.

Quelques trucs basiques pour sécuriser votre serveur. N'hésitez pas à aller plus loin.

**installer sudo** : 	

	apt-get install sudo

**créer un utilisateur admin** : 

	adduser admin

**donner à cet utilisateur un password** : 

	passwd admin

**ajouter les droits “sudo” pour l'utilisateur (afin qu'il puisse récupérer les droits roots)** : 

	echo 'admin ALL=(ALL) ALL' >> /etc/sudoers

**editer le fichier ssh pour empêcher une connection en root** : 

	nano /etc/ssh/sshd_config

Vous pouvez aussi ajouter d'autres utilisateurs sudo de la même façon si vous le voulez.

**Trouver la ligne “#PermitRootLogin”** et changer la valeur “Yes” ou “without-password”, en “no”.

Ctrl+x pour quitter. Répondre *yes* pour sauvegarder, et appuyer sur *enter* pour garder le nom.

Se connecter au serveur avec le nouvel utilisateur.

<a name="git-fr"></a>
###Installer git.

**installer git** : 

	sudo apt-get install git

<a name="make-fr"></a>	
###Installer make.

**installer make** :

	sudo apt-get install make

<a name="nodejs-fr"></a>
###Installer nodejs et npm.


**installer curl** : 

	sudo apt-get install curl

**installer nodejs** : 

	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash 
	sudo apt-get install -y nodejs

**nodejs -v** should give you a 5.something version.
<a name="mongodb-fr"></a>
###Installer mongodb.

**Suivre les instructions ici** : https://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian/

**C'est à dire faire:** 
	
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

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
<a name="transmission-fr"></a>
###Installer transmission.

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

	sudo /etc/init.d/transmission-daemon restart
	sudo /etc/init.d/transmission-daemon start

<a name="seedbox-fr"></a>
###Commencer avec Teurpi Torrent.

npm est déja installé via nodejs

On utilise
		
		git clone https://github.com/johnduro/seedbox42.git -o nomdurépertoirequevousvoulez
######Si le serveur transmission est deja existant et que vous avez quelques fichiers.

	node ttManager.js --transmission-to-conf
récupèrera les options de transmission dans la configuration.

	
	node ttManager.js --add-existing-torrents
pour ajouter les torrents de transmission à la base de donnée.

Et enfin 
	
	node ttManager.js  --add-directory /path/to/directory
vous demandera quels fichiers ajouter à partir d'un répertoire donné.

######Arborescence des fichiers conseillée avec un utilisateur teurpittorrent :

**/home/teurpitorrent/app** : pour git clone de l'application

**/home/teurpitorrent/ttFiles/complete** : dossier de fichiers complets

###Installer les dépendances.

	cd nomdurépertoire
	sudo npm install 
Si cela ne fonctionne pas, l'erreur peut être liée à make, gyp ou bcrypt, il faut suivre la partie suivante :

Vérifiez gyp  

	sudo npm install -g npm && sudo apt-get install g++ gyp
	sudo npm i -g node-gyp && sudo node-gyp clean
	
Enfin,
	
	sudo npm install 

Si cela ne marche toujours pas,
	
	sudo npm install bcrypt
	sudo npm install


###Utiliser ttManager.

ttManager est un outil pour gérer son serveur facilement et rapidement depuis la console, vous pouvez le lancer via la commande

	node ttManager.js (--option).

La commande suivante vous présente les diverses options

	node ttManager.js --help

De base, vous allez **devoir** générer un fichier de configuration par défaut avec l’option

	node ttManager.js --generate-conf 
	
Vous devrez choisir un port, un secret pour encrypter les passwords, l'adresse de la base de données mongo, et le nom de votre base. Puis les questions pour configurer transmission (adresse, port, etc). Si vous utilisez déjà transmission vous pouvez conserver le champ vide et suivre les instructions suivantes.

*Les valeurs par défauts peuvent être utilisées si tout est installé sur le même serveur.*

Vous allez **devoir** ajouter un utilisateur avec cette commande afin d'accéder à votre seedbox. Le mot de passe doit faire plus de 5 lettres. 

	node ttManager.js --create-user 
	
Si vous tentez d’ajouter un utilisateur dont le nom est deja rentré, mongo devrait renvoyer une erreur.

L'option suivante vous permet de modifier les informations d'un utilisateur existant.

	node ttManager.js --modify-user

###Pour lancer le serveur en daemon.

C'est ce qui permet de quitter la session ssh et de garder le serveur lancé.

Installer forever : 

	sudo npm install forever -g

Puis dans le répertoire seedbox : 

	npm install forever-monitor

Démarrez le serveur :

	forever start bin/www --minUptime 1000 --spinSleepTime 1000

Quelques commandes utiles : 
Stopper le serveur 

	forever stop bin/www
Lister les processus lancés 

	forever list


#####Maintenant vous pouvez vous connecter à votre serveur dans votre navigateur en rentrant l'adresse de votre serveur suivi du port choisi.

