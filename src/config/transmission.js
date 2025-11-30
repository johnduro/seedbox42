
import chalk from "chalk";

export default {
	configToTransmissionSettings : function (t, tSettings, done) {
		t.sessionGet(function (err, res) {
			if (err)
			{
				console.log(chalk.red("Could not retreive 'transmission' session infos"));
				done(err);
			}
			else
			{
				var tMod = {};
				for (var key in tSettings)
				{
					if (res.hasOwnProperty(key))
					{
						if (res[key] != tSettings[key])
							tMod[key] = tSettings[key];
					}
				}
				if (Object.keys(tMod).length > 0)
				{
					t.sessionSet(tMod, function (err, res) {
						if (err)
						{
							console.log("Session set error: ", err);
							console.log(chalk.red("Could not set session for transmission"));
							done(err);
						}
						done(null);
					});
				}
				else
					done(null);
			}
		});
	},

	transmissionSettingsToConfig : function (t, tSettings, done) {
		t.sessionGet(function (err, resp) {
			if (err)
			{
				console.log(chalk.red("Could not get session infos from transmission"));
				done(err);
			}
			else
			{
				for (var key in tSettings)
				{
					if (resp.hasOwnProperty(key))
					{
						if (tSettings[key] != resp[key])
							tSettings[key] = resp[key];
					}
				}
				done(null, tSettings);
			}
		});
	}
};
