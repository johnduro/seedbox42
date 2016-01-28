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
		"alt-speed-down": { "type": "number", "default": 50, "switch": false, "range": false },
		"alt-speed-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"alt-speed-time-begin": { "type": "number", "default": 540, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 1439 } },
		"alt-speed-time-day": { "type": "number", "default": 127, "switch": false, "range": true, "rangeValues": { "min": 0, "max": 127 } },
		"alt-speed-time-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"alt-speed-time-end": { "type": "number", "default": 1020, "switch": false, "range": true, "rangeValues": { "min": 1, "max": 1439 } },
		"alt-speed-up": { "type": "number", "default": 50, "switch": false, "range": false },
		"blocklist-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"blocklist-url": { "type": "string", "default": "http://www.example.com/blocklist", "switch": false, "range": false },
		"cache-size-mb": { "type": "number", "default": 4, "switch": false, "range": false },
		"dht-enabled": { "type": "boolean", "default": true, "switch": false, "range": false },
		"download-dir": { "type": "string", "default": "", "switch": false, "range": false },
		"download-queue-enabled": { "type": "boolean", "default": true, "switch": false, "range": false },
		"download-queue-size": { "type": "number", "default": 5, "switch": false, "range": false },
		"encryption": { "type": "string", "default": "preferred", "switch": true, "values": ["required", "preferred", "tolerated"], "range": false },
		"idle-seeding-limit": { "type": "number", "default": 30, "switch": false, "range": false },
		"idle-seeding-limit-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"incomplete-dir": { "type": "string", "default": "", "switch": false, "range": false },
		"incomplete-dir-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"lpd-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"peer-limit-global": { "type": "number", "default": 240, "switch": false, "range": false },
		"peer-limit-per-torrent": { "type": "number", "default": 60, "switch": false, "range": false },
		"peer-port": { "type": "number", "default": 51413, "switch": false, "range": true,"rangeValues": { "min": 49152, "max": 65535 } },
		"peer-port-random-on-start": { "type": "boolean", "default": false, "switch": false, "range": false },
		"pex-enabled": { "type": "boolean", "default": true, "switch": false, "range": false },
		"port-forwarding-enabled": { "type": "boolean", "default": true, "switch": false, "range": false },
		"queue-stalled-enabled": { "type": "boolean", "default": true, "switch": false, "range": false },
		"queue-stalled-minutes": { "type": "number", "default": 30, "switch": false, "range": false },
		"rename-partial-files": { "type": "boolean", "default": true, "switch": false, "range": false },
		"script-torrent-done-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"script-torrent-done-filename": { "type": "string", "default": "", "switch": false, "range": false },
		"seed-queue-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"seed-queue-size": { "type": "number", "default": 10, "switch": false, "range": false },
		"seedRatioLimit": { "type": "number", "default": 2, "switch": false, "range": false },
		"seedRatioLimited": { "type": "boolean", "default": false, "switch": false, "range": false },
		"speed-limit-down": { "type": "number", "default": 100, "switch": false, "range": false },
		"speed-limit-down-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"speed-limit-up": { "type": "number", "default": 100, "switch": false, "range": false },
		"speed-limit-up-enabled": { "type": "boolean", "default": false, "switch": false, "range": false },
		"start-added-torrents": { "type": "boolean", "default": true, "switch": false, "range": false },
		"trash-original-torrent-files": { "type": "boolean", "default": false, "switch": false, "range": false },
		"utp-enabled": { "type": "boolean", "default": true, "switch": false, "range": false }
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
		"default-avatar": { "type": "string", "default": "default.png", "switch": false, "range": false, "infos": "Name of the default avatar (You have to upload it to public/assets/avatar)" }
	}
}
