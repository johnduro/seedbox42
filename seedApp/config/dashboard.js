

module.exports = {
	match : {
		"name": { "type": "string", "default": "new module", "switch": false, "range": false },
		"enabled": { "type": "string", "default": "all", "switch": true, "values": ["all", "user", "admin", "none"], "range": false },
		"template": { "type": "string", "default": "dashboard-fileList", "switch": true, "values": ["dashboard-fileList", "graph", "dashboard-chat"], "range": false },
		"title": { "type": "string","default": "my new module", "switch": false, "range": false },
		"order": { "type": "number", "default": 0, "switch": false, "range": false }
	},
	panels : [
		{
			"name": "recent-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "latest upload files",
			"order": 0
		},
		{
			"name": "recent-user-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "your latest upload files",
			"order": 1
		},
		{
			"name": "oldest-user-locked-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "your oldest locked files",
			"order": 2
		},
		{
			"name": "oldest-locked-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "oldest locked files",
			"order": 3
		},
		{
			"name": "best-rated-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "best rated file",
			"order": 4
		},
		{
			"name": "most-commented-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "most commented file",
			"order": 5
		},
		{
			"name": "disk-space",
			"enabled": "all",
			"template": "graph",
			"title": "disk space",
			"order": 6
		},
		{
			"name": "minichat",
			"enabled": "all",
			"template": "dashboard-chat",
			"title": "minichat",
			"order": 7
		},
		{
			"name": "most-downloaded-file",
			"enabled": "all",
			"template": "dashboard-fileList",
			"title": "most downloaded file",
			"order": 8
		}
	]
};
