var dashboard = require('../config/dashboard');

module.exports = {
	"appPort": { "type": "number", "default": 3000, "switch": false, "range": true, "rangeValues": { "min": 1024, "max": 65535 } },
	"secret": { "type": "string", "default": "", "switch": false, "range": false },
	"mongodb": {
		"address": { "type": "string", "default": "localhost", "switch": false, "range": false },
		"name" : { "type": "string", "default": "seedapp", "switch": false, "range": false }
	},
	"transmission": {
		"address": { "type": "string", "default": "localhost", "switch": false, "range": false, "infos": "Adress of your transmission client" },
		"port": { "type": "number", "default": 9091, "switch": false, "range": true, "rangeValues": { "min": 1024, "max": 65535 }, "infos": "Port of your transmission client" },
		"url": { "type": "string", "default": "/transmission/rpc", "switch": false, "range": false, "infos": "Url of the transmission rpc" }
	},
	"transmission-settings": {
		"alt-speed-down": { "type": "number", "default": 50, "switch": false, "range": false, "infos": "max global download speed (KBps)" },
		"alt-speed-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means use the alt speeds" },
		"alt-speed-time-begin": { "type": "number", "default": 540, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 1439 }, "infos": "when to turn on alt speeds (units: minutes after midnight)" },
		"alt-speed-time-day": { "type": "number", "default": 127, "switch": false, "range": true, "rangeValues": { "min": 0, "max": 127 }, "infos": "what day(s) to turn on alt speeds (look at tr_sched_day)" },
		"alt-speed-time-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means the scheduled on/off times are used" },
		"alt-speed-time-end": { "type": "number", "default": 1020, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 1439 }, "infos": "when to turn off alt speeds (units: minutes after midnight)" },
		"alt-speed-up": { "type": "number", "default": 50, "switch": false, "range": false, "infos": "max global upload speed (KBps)" },
		"blocklist-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means enabled" },
		"blocklist-url": { "type": "string", "default": "http://www.example.com/blocklist", "switch": false, "range": false, "infos": "location of the blocklist to use for 'blocklist-update'" },
		"cache-size-mb": { "type": "number", "default": 4, "switch": false, "range": false, "infos": "maximum size of the disk cache (MB)" },
		"dht-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "true means allow dht in public torrents" },
		"download-dir": { "type": "string", "default": "", "switch": false, "range": false, "infos": "default path to download torrents" },
		"download-queue-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "if true, limit how many torrents can be downloaded at once" },
		"download-queue-size": { "type": "number", "default": 5, "switch": false, "range": false, "infos": "max number of torrents to download at once (see download-queue-enabled)" },
		"encryption": { "type": "string", "default": "preferred", "switch": true, "values": ["required", "preferred", "tolerated"], "range": false },
		"idle-seeding-limit": { "type": "number", "default": 30, "switch": false, "range": false, "infos": "torrents we're seeding will be stopped if they're idle for this long" },
		"idle-seeding-limit-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true if the seeding inactivity limit is honored by default" },
		"incomplete-dir": { "type": "string", "default": "", "switch": false, "range": false, "infos": "path for incomplete torrents, when enabled" },
		"incomplete-dir-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means keep torrents in incomplete-dir until done" },
		"lpd-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means allow Local Peer Discovery in public torrents" },
		"peer-limit-global": { "type": "number", "default": 240, "switch": false, "range": false, "infos": "maximum global number of peers" },
		"peer-limit-per-torrent": { "type": "number", "default": 60, "switch": false, "range": false, "infos": "maximum global number of peers" },
		"peer-port": { "type": "number", "default": 51413, "switch": false, "range": true,"rangeValues": { "min": 49152, "max": 65535 }, "infos": "port number" },
		"peer-port-random-on-start": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means pick a random peer port on launch" },
		"pex-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "true means allow pex in public torrents" },
		"port-forwarding-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "true means enabled" },
		"queue-stalled-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "whether or not to consider idle torrents as stalled" },
		"queue-stalled-minutes": { "type": "number", "default": 30, "switch": false, "range": false, "infos": "torrents that are idle for N minuets aren't counted toward seed-queue-size or download-queue-size" },
		"rename-partial-files": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "true means append '.part' to incomplete files" },
		"script-torrent-done-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "whether or not to call the 'done' script" },
		"script-torrent-done-filename": { "type": "string", "default": "", "switch": false, "range": false, "infos": "filename of the script to run" },
		"seed-queue-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "if true, limit how many torrents can be uploaded at once" },
		"seed-queue-size": { "type": "number", "default": 10, "switch": false, "range": false, "infos": "max number of torrents to uploaded at once (see seed-queue-enabled)" },
		"seedRatioLimit": { "type": "number", "default": 2, "switch": false, "range": false, "infos": "the default seed ratio for torrents to use" },
		"seedRatioLimited": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true if seedRatioLimit is honored by default" },
		"speed-limit-down": { "type": "number", "default": 100, "switch": false, "range": false, "infos": "max global download speed (KBps)" },
		"speed-limit-down-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means enabled" },
		"speed-limit-up": { "type": "number", "default": 100, "switch": false, "range": false, "infos": "max global upload speed (KBps)" },
		"speed-limit-up-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means enabled" },
		"start-added-torrents": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "true means added torrents will be started right away" },
		"trash-original-torrent-files": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "true means the .torrent file of added torrents will be deleted" },
		"utp-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "true means allow utp" }
	},
	"torrents": {
		"add-torrent-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "Allow users to add torrents to transmission" },
		"delete-torrent-enabled": { "type": "boolean", "default": true, "switch": false, "range": false, "infos": "Allow users to delete torrents from transmission" }
//		"settings-access-enabled": { "type": "boolean", "default": false, "switch": false, "range": false }
	},
	"files": {
		"show-creator": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false, "infos": "Who can see the names of the downloaders" },
		"lock-enabled": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false, "infos": "Who can lock files" },
		"comments-enabled": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false, "infos": "Who can comment files" },
		"grades-enabled": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false, "infos": "Who can grade files" },
		"auto-remove-lock-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "Activate to automaticaly remove files lock after a number of days" },
		"auto-remove-lock": { "type": "number", "default": 300, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 1000 }, "infos": "Number of days after what files are automaticaly unlocked" },
		"auto-delete-enabled": { "type": "boolean", "default": false, "switch": false, "range": false, "infos": "Activate to automaticaly delete files after a number of days" },
		"auto-delete": { "type": "number", "default": 60, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 1000 }, "infos": "Number of days after what files are automaticaly deleted" }
	},
	"dashboard": {
		"panels": { "type": "array", "default": dashboard.panels, "switch": false, "range": false, "match": dashboard.match },
		"file-number-exhibit": { "type": "number", "default": 5, "switch": false, "range": false, "infos": "Number of files shown in panel's files list" },
		"mini-chat-message-limit": { "type": "number", "default": 100, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 10000 }, "infos": "Number of messages recorded in the chat (1 to 10000)" }
	},
	"users": {
		"show-connected": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false, "infos": "Who can see the users currently connected" },
		"default-avatar": { "type": "string", "default": "default.png", "switch": false, "range": false, "infos": "Name of the default avatar (You have to upload it to public/assets/avatar)" }
	}
}
