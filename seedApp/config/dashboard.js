

module.exports = {
	match : {
		"name": { "type": "string", "default": "new module", "switch": false, "range": false },
		"enabled": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false },
		"type": { "type": "string", "default": "file-list", "switch": true, "values": ["file-list", "graph", "chat"], "range": false },
		"title": { "type": "string","default": "my new module", "switch": false, "range": false },
		"order": { "type": "number", "default": 0, "switch": false, "range": false }
	},
	panels : [
		{
			"name": "recent-file",
			"enabled": "all",
			"type": "file-list",
			"title": "latest upload files",
			"order": 0
		},
		{
			"name": "recent-user-file",
			"enabled": "all",
			"type": "file-list",
			"title": "your latest upload files",
			"order": 1
		},
		{
			"name": "oldest-user-locked-file",
			"enabled": "all",
			"type": "file-list",
			"title": "your oldest locked files",
			"order": 2
		},
		{
			"name": "oldest-locked-file",
			"enabled": "all",
			"type": "file-list",
			"title": "oldest locked files",
			"order": 3
		},
		{
			"name": "best-rated-file",
			"enabled": "all",
			"type": "file-list",
			"title": "best rated file",
			"order": 4
		},
		{
			"name": "most-commented-file",
			"enabled": "all",
			"type": "file-list",
			"title": "most commented file",
			"order": 5
		},
		{
			"name": "disk-space",
			"enabled": "all",
			"type": "graph",
			"title": "disk space",
			"order": 6
		},
		{
			"name": "minichat",
			"enabled": "all",
			"type": "chat",
			"title": "minichat",
			"order": 7
		}
	]
};
