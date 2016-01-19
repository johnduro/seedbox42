#Seedbox Teurpi Torrent
 

**Setting up a debian vm** : https://jtreminio.com/2012/07/setting-up-a-debian-vm-step-by-step/

**Download VMbox**

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

**install emacs** : 

	apt-get emacs

**edit ssh file in order to disallow a root connection** : 

	emacs /etc/ssh/sshd_config

**Find the line “#PermitRootLogin”** and change the value “Yes” or “without-password”, by “no”.

Save with ctrl+x then ctrl+s. Use ctrl+x then ctrl+c to quit.

Connect to your server with the new user.

For the following parts, type **sudo su** in order to get the root rights.

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

By using the command mongo, you open a console, you can enter the following commands in order to check the 
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

	sudo emacs /etc/transmission-daemon/settings.json

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
	
(remember to not forget the sudo if you want to create a new file)

The following optionoption allow you to add a new user to the database (password must at least contain 5 characters).

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

#####Recommanded Treeview for a teurpittorrent user :

**/home/teurpitorrent/app** : git clone of the app

**/home/teurpitorrent/ttFiles/complete** : completed files directory

**/home/teurpitorrent/ttFiles/incomplete** : temporary files directory

