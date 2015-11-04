var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/settings', function (req, res, next) {
	var config = req.app.get('config');
	var ret = {
		"transmission": config.transmission,
		"transmission-settings": config["transmission-settings"],
		"files": config.files,
		"dashboard": config.dashboard,
		"users": config.users
	};
	res.json({ success: true, data: ret });
});

router.put('/settings/transmission-settings', function (req, res, next) {
	if (req.user.role == 0)
	{
		var tSettings = req.app.get('config')["transmission-settings"];
		var tMod = {};
		var transmission = req.app.get('transmission');
		for (var key in req.body)
		{
			if (tSettings.hasOwnProperty(key))
			{
				if (tSettings[key] != req.body[key])
					tMod[key] = req.body[key];
			}
		}
		transmission.sessionSet(tMod, function (err, res) {
			if (err)
				res.json({ success: false, message: err });
			else
			{
				transmission.sessionGet(function (err, res) {
					if (err)
						res.json({ success: true, message: "transmission settings succesfully updated, but could not get session infos from transmission" });
					else
					{
						for (var key in tSettings)
						{
							if (res.hasOwnProperty(key))
							{
								if (tSettings[key] != res[key])
									tSettings[key] = res[key];
							}
						}
						req.app.get('config')["transmission-settings"] = tSettings;
						res.json({ success: true, message: "transmission settings succesfully updated", data: tSettings });
					}
				});
			}
				res.json({ success: true, message: "transmission settings succesfully updated", data: res });
		});
	}
	else
		res.json({ success: false, message: "You don't have enought rights for this action" });
});

module.exports = router;
