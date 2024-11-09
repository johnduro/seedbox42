import express from "express";
import File from "../models/File.js";
import upload from "../middlewares/upload.js";
import rights from "../middlewares/rights.js";
import format from "../utils/format.js";

const router = express.Router();

router.post('/add-url', async (req, res, next) => {
	try {
		const resp = await req.app.locals.transmission.torrentAdd({ filename: req.body.url });
		if ('torrent-duplicate' in resp) {
			return res.status(409).json({ message: 'duplicate, torrent already present' });
		} else if ('torrent-added' in resp) {
			try {
				const file = await File.createFile(resp['torrent-added'], req.user._id);
				return res.json({ message: 'torrent successfully added', id: resp['torrent-added']['id'], name: file.name });
			} catch (err) {
				return res.status(500).json({ message: 'Torrent was successfully added but there was an issue when adding it to the database', error: err, id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
			}
		} else {
			return res.status(500).json({ message: 'unexpected error' });
		}
	} catch (err) {
		return res.status(404).json({ message: 'torrent not added, wrong url', error: err.message });
	}
});

router.post('/add-torrents', upload.torrent.array('torrent', 10), async (req, res, next) => {
	const resAll = [];
	var isError = false;

	for (const file of req.files) {
		try {
			const resp = await req.app.locals.transmission.torrentAdd({ filename: file.path });
			console.log('resp: ', resp);
			if ('torrent-duplicate' in resp) {
				resAll.push({ success: false, message: 'duplicate, torrent already present', file: file.originalname });
			} else if ('torrent-added' in resp) {
				try {
					const newFile = await File.createFile(resp['torrent-added'], req.user._id);
					resAll.push({ success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: newFile.name });
					req.app.io.sockets.emit('post:torrent', { success: true, message: 'torrent successfully added', id: resp['torrent-added']['id'], name: newFile.name });
				} catch (err) {
					resAll.push({ success: false, message: 'Torrent was successfully added but there was an issue when adding it to the database', error: err, id: resp['torrent-added']['id'], name: resp['torrent-added']['name'] });
					isError = true;
				}
			} else {
				resAll.push({ success: false, message: 'unexpected error', file: file.originalname });
				isError = true;
			}
		} catch (err) {
			resAll.push({ success: false, message: 'torrent not added, wrong file', file: file.originalname, error: err.message });
			isError = true;
		}
	}
	var returnCode = isError ? 400 : 200;

	res.status(returnCode).json(resAll);
});

router.get('/refresh/:id', async (req, res, next) => {
	try {
	  const id = parseInt(req.params.id, 10);
	  console.log(`Refreshing torrent with ID: ${id}`);
  
	  const transmission = req.app.locals.transmission;
	  const resp = await transmission.torrentGet(transmission.requestFormat.refreshAll, id);
  
	  console.log(`Torrent with ID: ${id} refreshed successfully`);
	  res.json({ data: resp });
	} catch (err) {
	  console.error(`Error refreshing torrent with ID: ${req.params.id}`, err);
	  res.status(500).json({ message: 'Error refreshing torrent', error: err.message });
	}
  });

router.delete('/', async (req, res, next) => {
	try {
		const removeLocalData = req.body.removeLocalData;
		const ids = format.torrentsIds(req.body.ids);

		if (removeLocalData) {
			const resp = await req.app.locals.transmission.torrentGet(['hashString'], ids);
			const toFind = resp['torrents'].map(torrent => torrent.hashString);
			await File.deleteMany({ 'hashString': { $in: toFind } });
		}

		const response = await req.app.locals.transmission.torrentRemove(ids, removeLocalData);
		res.json({ message: 'Torrent(s) successfully removed', data: response });
	} catch (err) {
		console.error('Error removing torrents:', err);
		res.status(500).json({ message: 'Could not remove torrent(s)', error: err.message });
	}
});

router.post('/move/:direction', async (req, res, next) => {
	const direction = req.params.direction;
	try {
		const ids = format.torrentsIds(req.body.ids);

		const response = await req.app.locals.transmission.queueMovementRequest(direction, ids);

		res.json({ message: `Torrent(s) successfully moved ${direction}`, data: response });
	} catch (err) {
		res.status(500).json({ message: `Could not move torrent(s) ${direction}`, error: err.message });
	}
});

router.post('/action/:action', async function (req, res, next) {
	try {
		const action = req.params.action; 
		const ids = format.torrentsIds(req.body.ids);

		let response = await req.app.locals.transmission.torrentActionRequest(action, ids);
		res.json({ message: `Action ${action} performed successfully`, data: response });
	} catch (err) {
		console.error(`Error performing action ${req.params.action} on torrents:`, err);
		res.status(500).json({ success: false, message: `Error performing action ${req.params.action}`, error: err.message });
	}
});

router.put('/rename/:id', async (req, res, next) => {
	const newName = req.body.newName;
	const id = format.torrentsIds([req.params.id])[0];
	const transmission = req.app.locals.transmission;

	try {
		const respGet = await transmission.torrentGet(['hashString', 'downloadDir'], id);
		if (respGet.torrents.length > 0) {
			const torrent = respGet.torrents[0];
			const file = await File.findOne({ hashString: torrent.hashString }, { path: 1, name: 1 }).exec();
			if (!file) {
				return res.status(404).json({ message: 'Could not find file' });
			}

			const respRename = await transmission.torrentRenamePath(id, file.name, newName);
			file.name = newName;
			await file.save();

			res.json({ message: 'Torrent renamed successfully', data: respRename });
		} else {
			res.status(404).json({ message: 'Torrent not found' });
		}
	} catch (err) {
		res.status(500).json({ message: 'Error renaming torrent', error: err.message });
	}
});

router.get('/session-stats', async (req, res, next) => {
	try {
	  const resp = await req.app.locals.transmission.sessionStats();
	  res.json({ data: resp });
	} catch (err) {
	  console.error('Error getting session stats:', err);
	  res.status(500).json({ message: 'Could not get session stats', error: err.message });
	}
  });

router.get('/session-get', async (req, res, next) => {
	try {
	  const resp = await req.app.locals.transmission.sessionGet();
	  res.json({ data: resp });
	} catch (err) {
	  console.error('Error getting session details:', err);
	  res.status(500).json({ message: 'Could not get session detailed infos', error: err.message });
	}
  });

https://github.com/Naunter/BT_BlockLists/raw/master/bt_blocklists.gz
router.post('/blocklist-update', async (req, res, next) => {
	try {
	  const resp = await req.app.locals.transmission.blocklistUpdate();
	  res.json({ message: "Blocklist successfully updated", data: resp });
	} catch (err) {
	  console.error('Error updating blocklist:', err);
	  res.status(500).json({ message: "Could not update blocklist", error: err.message });
	}
  });

router.get('/port-test', async (req, res, next) => {
	try {
	  const resp = await req.app.locals.transmission.portTest();
	  res.json({ message: "Port checked", "port-is-open": resp["port-is-open"] });
	} catch (err) {
	  console.error('Error checking port:', err);
	  res.status(500).json({ message: "Could not check port", error: err.message });
	}
  });

router.post('/session-shutdown', rights.admin, async (req, res, next) => {
	try {
	  const resp = await req.app.locals.transmission.sessionClose();
	  res.json({ message: "Session closed successfully", data: resp });
	} catch (err) {
	  console.error('Error closing session:', err);
	  res.status(500).json({ message: "Could not close session", error: err.message });
	}
  });

router.get('/get-all-torrents', async (req, res, next) => {
	try {
	  const torrents = await req.app.locals.transmission.torrentGet(req.app.locals.transmission.requestFormat.refreshAll);
	  res.json({ data: torrents });
	} catch (err) {
	  res.status(500).json({ message: 'Error fetching torrents', error: err.message });
	}
  });

export default router;
