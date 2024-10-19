# Seedbox Teurpi Torrent.

______________________
Creative Commons License

![alt tag](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)

Teurpi Torrent is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

Based on a work at https://github.com/johnduro/seedbox42.
______________________

![!alt tag](https://cloud.githubusercontent.com/assets/6706015/12647149/023de2de-c5d4-11e5-9451-e5cfa0b2bf55.png)

**Teurpi Torrent** vous permet de transformer votre serveur dédié en **seedbox** facilement.

Teurpi Torrent est un projet réalisé par des étudiants de l'école 42.

Disposant d'une **interface web claire** pour Transmission, il permet une gestion complète des utilisateurs et de leurs accès. Il autorise le téléchargement de torrents, la gestion des fichiers téléchargés ainsi que la possibilité de streamer des médias.

Ce tutorial est destiné à des débutants avec un serveur debian.

[Tutorial français](#french)<br><br>

**Teurpi Torrent** allows you to turn a dedicated server into a **seedbox** easily.

Teurpi Torrent is a project made by students from 42 school.

Providing a **neat web interface** for Transmission, it allows to manage several users and their access. You can also download torrents files easily, manage your downloaded files and even stream your content.

This tutorial is aimed at beginners with a debian server.

[English Tutorial](#english)

![alt tag](https://cloud.githubusercontent.com/assets/6706015/12647148/0234537c-c5d4-11e5-87f8-8aa658eb1ff1.png)
<br>
![alt tag](https://cloud.githubusercontent.com/assets/6706015/12647143/022353b0-c5d4-11e5-8a6a-9aa8e309c9c6.png)

More screens [here](#screens)
Plus d'images [ici](#screens)

<br>
##<a name="english"></a>English Tutorial
<br>

### Prerequisite :

- [install sudo](#secure)
(how to secure your server)
- [create user with sudo rights](#createuser)
- [install git](#git)
- [install make](#make)
- [install nodejs](#nodejs)
- [install mongo](#mongodb)
- [install transmission](#transmission)

If all the above is installed, follow this part.

- [**INSTALL TEURPI TORRENT SEEDBOX**](#seedbox)

<a name="secure"></a>

### Install sudo (and secure your access).

Some basics needed to secure your server a bit. Feel free to go further...

**install sudo** :

	apt-get install sudo

*The following part is optional but help you to secure your server.*
<a name="createuser"></a>

##### Create a new user with sudo rights

**create a user named admin** :

	adduser admin

**add “sudo” rights for the user** :

	echo 'admin ALL=(ALL) ALL' >> /etc/sudoers

**edit ssh file in order to prevent a root connection** :

	nano /etc/ssh/sshd_config

You can add several others users with sudo rights if you want.

**Find the line “#PermitRootLogin”** and change the value “Yes” or “without-password”, by “no”.

Ctrl+x to exit. Answer *yes* to save, and press *enter* to keep the name.

Connect to your server with the new user.


<a name="git"></a>

### Install git.

	sudo apt-get install git
<a name="make"></a>

### Install make.

	sudo apt-get install make

<a name="nodejs"></a>

### Install nodejs and npm.


**install curl** :

	sudo apt-get install curl

**install nodejs** :

	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash
	sudo apt-get install -y nodejs

**nodejs -v** should give you a 5.something version
<a name="mongodb"></a>

### Install mongodb.

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

### Install transmission.

Do a

	sudo apt-get install transmission-cli transmission-common transmission-daemon
To launch the process

	sudo /etc/init.d/transmission-daemon start
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

### Starting with Teurpi Torrent.

*If you want your server to be managed by its own user*
**create a teurpitorrent user** :

	adduser teurpitorrent

Connect with the user

	su teurpitorrent

Make a directory to save the files

	mkdir -p /home/teurpitorrent/ttFiles/complete

We give the write permission to transmission in the directory (first you need to use the old sudo user using the command "exit")

	sudo chown :debian-transmission -R /home/teurpitorrent/ttFiles/

We add the user teurpitorrent to the group debian-transmission

	sudo useradd -G debian-transmission teurpitorrent

Take back the teurpitorrent user. Use the git clone to get seedbox files in your chosen directory. (here named 'app').

	git clone https://github.com/johnduro/seedbox42.git app

### Install the dependencies.

	cd app
	npm install

----- If error, take back your sudo user and follow this part -----

If it doesn’t work, it can be an error linked to make, gyp or bcrypt, you should follow the following part :

Check gyp

	sudo npm install -g npm && sudo apt-get install g++ gyp
	sudo npm i -g node-gyp && sudo node-gyp clean
If it’s not working,

	sudo npm install bcrypt
Lastly,

	sudo npm install
again


### Create a configuration file.

ttManager is a tool to manage your serv easily and fast from the shell, you can launch it with

	node ttManager.js [--option]

The following command give you all the options

	node ttManager.js --help

**Generate the configuration** with the option

	node ttManager.js --generate-conf

You'll have to choose the port you want, a secret to encrypt passwords, your mongo database address, and the name of your database. Then you'll get others questions for transmission (address, port, etc). Note that if you already use transmission, you can keep a blank field for the directory and follow further instructions.

*You can use defaults values, if you installed all things on one server.*

Add a user with this command in order to get access to the seedbox web interface. Password must be 5 letters or more.

	node ttManager.js --create-user

If you try to add an existing name, mongo should get you an error.

The following option allow you to edit the informations (name, pass etc.) of an existing user.

	node ttManager.js --modify-user

##### If you already have a transmission server and some files.

use

	node ttManager.js --transmission-to-conf
to translate your transmission files to the new config.

Then

	node ttManager.js --add-existing-torrents
to add current existings torrents from transmission to the db.

And

	node ttManager.js  --add-directory /path/to/directory
to add the selected files from a specific directory.


### How to launch the server as a daemon process.

It is used in order to leave the ssh connection without stopping the server.

First you need to install forever with the sudo user :

	sudo npm install forever -g

Then, at the seedbox directory with your teurpitorrent user :

	npm install forever-monitor

Now, to start your server :

	forever start bin/www --minUptime 1000 --spinSleepTime 1000

Some others useful commands :
stop the server

	forever stop bin/www
listing launched process

	forever list


##### Now you can connect to your server in your browser, by using the server adress followed by the selected port.
<br>
_______________
<br>

# Seedbox Teurpi Torrent.

<br><br>
##<a name="french"></a>Installation française.
<br>

### Prérequis :


- [installer sudo](#secure-fr)
(vous pouvez voir comment securiser votre serveur)
- [créer un utilisateur avec les droits sudo](#createuser-fr)
- [installer git](#git-fr)
- [installer make](#make-fr)
- [installer nodejs](#nodejs-fr)
- [installer mongo](#mongodb-fr)
- [installer transmission](#transmission-fr)

Si tout est installé, suivez cette partie :

- [**INSTALLATION DE LA SEEDBOX TEURPI TORRENT**](#seedbox-fr)

<a name="secure-fr"></a>
###Installer sudo (et sécuriser votre accès).

Quelques trucs basiques pour sécuriser votre serveur. N'hésitez pas à aller plus loin.

**installer sudo** :

	apt-get install sudo

*La partie qui suit est optionnelle mais vous aide à sécuriser votre serveur.*
<a name="createuser-fr"></a>
#####Créer un utilisateur avec les droits sudo

**créer un utilisateur admin** :

	adduser admin

**si vous voulez ajouter les droits “sudo” pour l'utilisateur (afin qu'il puisse récupérer les droits roots)** :

	echo 'admin ALL=(ALL) ALL' >> /etc/sudoers

**editer le fichier ssh pour empêcher une connection en root** :

	nano /etc/ssh/sshd_config

Vous pouvez aussi ajouter d'autres utilisateurs sudo de la même façon si vous le voulez.

**Trouver la ligne “#PermitRootLogin”** et changer la valeur “Yes” ou “without-password”, en “no”.

Ctrl+x pour quitter. Répondre *yes* pour sauvegarder, et appuyer sur *enter* pour garder le nom.

Se connecter au serveur avec le nouvel utilisateur.

<a name="git-fr"></a>

### Installer git.


	sudo apt-get install git

<a name="make-fr"></a>

### Installer make.


	sudo apt-get install make

<a name="nodejs-fr"></a>

### Installer nodejs et npm.


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

### Installer transmission.

Faire

	sudo apt-get install transmission-cli transmission-common transmission-daemon
Pour lancer le processus

	 sudo /etc/init.d/transmission-daemon start
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

### Commencer avec Teurpi Torrent.

*Si vous voulez que le serveur tourne sur son propre utilisateur*
**créer un utilisateur teurpitorrent** :

	adduser teurpitorrent

On se connecte avec l'utilisateur

	su teurpitorrent

On créée un dossier pour enregistrer les fichiers

	mkdir -p /home/teurpitorrent/ttFiles/complete

On donne les droits à transmission d'écrire dans le dossier (attention vous devrez reprendre l'ancien utilisateur avec "exit")

	sudo chown :debian-transmission -R /home/teurpitorrent/ttFiles/

On ajoute aussi l'user teurpitorrent au groupe debian-transmission

	sudo useradd -G debian-transmission teurpitorrent

On repasse avec l'utilisateur teurpitorrent. On utilise le git clone, pour récupérer les fichiers de la seedbox dans le répertoire de votre choix (ici nommé 'app').

	git clone https://github.com/johnduro/seedbox42.git app

### Installer les dépendances.

	cd app
	npm install

----- Si erreur il y'a, reprenez votre utilisateur sudo et suivez cette partie -----

Si cela ne fonctionne pas, l'erreur peut être liée à make, gyp ou bcrypt, il faut suivre la partie suivante :

Vérifiez gyp

	sudo npm install -g npm && sudo apt-get install g++ gyp
	sudo npm i -g node-gyp && sudo node-gyp clean

Enfin,

	sudo npm install

Si cela ne marche toujours pas,

	sudo npm install bcrypt
	sudo npm install


### Création du fichier de configuration.

ttManager est un outil pour gérer son serveur facilement et rapidement depuis la console, vous pouvez le lancer via la commande

	node ttManager.js [--option]

La commande suivante vous présente les diverses options

	node ttManager.js --help

**Générez un fichier de configuration** avec l’option

	node ttManager.js --generate-conf

Vous devrez choisir un port, un secret pour encrypter les passwords, l'adresse de la base de données mongo, et le nom de votre base. Puis les questions pour configurer l'accès à transmission (adresse, port, etc). Si vous utilisez déjà transmission, vous pouvez conserver le champ du choix de répertoire de téléchargement vide et suivre les instructions suivantes, sinon choisissez l'endroit où vous voulez télécharger ces fichiers.

*Les valeurs par défauts peuvent être utilisées si tout est installé sur le même serveur.*

**Ajoutez un utilisateur** avec cette commande afin d'accéder à votre seedbox. Le mot de passe doit faire plus de 5 lettres.

	node ttManager.js --create-user

Si vous tentez d’ajouter un utilisateur dont le nom est deja rentré, mongo devrait renvoyer une erreur.

L'option suivante vous permet de modifier les informations d'un utilisateur existant.

	node ttManager.js --modify-user

###### Si le serveur transmission est deja existant et/ou que vous avez quelques fichiers.

	node ttManager.js --transmission-to-conf
récupèrera les options de transmission dans la configuration.


	node ttManager.js --add-existing-torrents
pour ajouter les torrents de transmission à la base de donnée.

Et enfin

	node ttManager.js  --add-directory /path/to/directory
vous demandera quels fichiers ajouter à partir d'un répertoire donné.


###Pour lancer le serveur en daemon.

C'est ce qui permet de quitter la session ssh et de garder le serveur lancé.

Installer forever en reprenant l'utisateur sudo :

	sudo npm install forever -g

Puis dans le répertoire seedbox sous l'utilisateur teurpitorrent :

	npm install forever-monitor

Démarrez le serveur :

	forever start bin/www --minUptime 1000 --spinSleepTime 1000

Quelques commandes utiles :
Stopper le serveur

	forever stop bin/www
Lister les processus lancés

	forever list


#####Maintenant vous pouvez vous connecter à votre serveur dans votre navigateur en rentrant l'adresse de votre serveur suivi du port choisi.


<br>
##<a name="screens"></a>Screens shots

![alt tag](https://cloud.githubusercontent.com/assets/6706015/12647141/021a0170-c5d4-11e5-89a8-716655246f35.png)
<br>
![alt tag](https://cloud.githubusercontent.com/assets/6706015/12647144/02242bdc-c5d4-11e5-9f75-97af73eb4406.png)
<br>
![alt tag](https://cloud.githubusercontent.com/assets/6706015/12647145/022796f0-c5d4-11e5-8a63-f5abb9903ecb.png)
