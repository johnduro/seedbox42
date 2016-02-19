var http = require('http');


var UsersConn = module.exports = function () {
	this.usersConnected = {};
	this.usersNbr = 0;
	this.options = {
		// host: "freegeoip.net"
		host: "ipinfo.io"
	};
};

UsersConn.prototype.newConnection = function (uip, user) {
	var self = this;
	if (!(uip in self.usersConnected))
	{
		self.usersConnected[uip] = [user];
		self.usersNbr++;
	}
	else
	{
		var isIn = false;
		self.usersConnected[uip].forEach(function (recUser) {
			if (recUser.login == user.login)
				isIn = true;
		});
		if (!isIn)
		{
			self.usersConnected[uip].push(user);
			self.usersNbr++;
		}
	}
};

UsersConn.prototype.disconnect = function (uip, user) {
	var self = this;
	if (uip in self.usersConnected)
	{
		var len = self.usersConnected[uip].length;
		for (var i = 0; i < len; i++)
		{
			if (self.usersConnected[uip][i].login == user.login)
			{
				self.usersConnected[uip].splice(i, 1);
				self.usersNbr--;
				break ;
			}
		}
		if (self.usersConnected[uip].length == 0)
			delete self.usersConnected[uip];
	}
};

UsersConn.prototype.clean = function () {
	var self = this;
	self.usersConnected = {};
	self.usersNbr = 0;
};

UsersConn.prototype.getList = function () {
	var self = this;
	var list = [];
	var count = {};
	for (var uip in self.usersConnected)
	{
		self.usersConnected[uip].forEach(function (user) {
			var login = '';
			if (!(user.login in count))
			{
				count[user.login] = 1;
				login = user.login;
			}
			else
			{
				count[user.login]++;
				login = user.login + ' (' + count[user.login] + ')';
			}
			list.push(login);
		});
	}
	return list;
};

UsersConn.prototype.getUsersCount = function () {
	var self = this;
	return(self.usersNbr);
};

UsersConn.prototype.getDetails = function (done) {
	var self = this;
	var list = [];
	var uips = Object.keys(self.usersConnected);
	var i = 0;
	(function next () {
		var uip = uips[i++];
		if (!uip)
			return done(null, list);

		// self.options.path = '/json/' + uip;
		self.options.path = '/' + uip + '/json';

		http.request(self.options, function (response) {
			var str = '';

			response.on('data', function (chunk) {
				str += chunk;
			});

			response.on('end', function () {
				var jsonData = JSON.parse(str);
				self.usersConnected[uip].forEach(function (user) {
					user.ip = jsonData.ip;
					// user.location = jsonData.city + ' - ' + jsonData.region_name + ' - ' + jsonData.country_name;
					user.location = jsonData.city + ' - ' + jsonData.region + ' - ' + jsonData.country;
					list.push(user);
				});
				next();
			});
		}).end();
	})();
};
