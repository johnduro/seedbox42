import express from "express";
import atob from "atob";
import File from "../models/File.js";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import authentication from "../utils/authentication.js";


const router = express.Router();

function removeTrailingSlash(filePath) {
    return filePath.endsWith('/') ? filePath.slice(0, -1) : filePath;
}

router.get('/file/:id/:pathInDirectory/:name', async (req, res, next) => {
    try {
        const fileId = req.params.id;
        const pathInDirectory = atob(req.params.pathInDirectory);
        const decodedName = atob(req.params.name);

        const token = req.query.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decodedToken = await authentication.getDecodedToken(token, req.app.locals.ttConfig.secret);
        if (!decodedToken) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        if (decodedToken.fileIdToDownload !== req.params.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }


        const file = await File.findById(fileId).select('path downloads');
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        let filePath = path.join(file.getPath(), pathInDirectory);
        filePath = path.normalize(filePath);
        filePath = removeTrailingSlash(filePath);

        if (!file.isPathInDirectory(filePath)) {
            return res.status(400).json({ message: 'Invalid path' });
        }

        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
            const zipPath = path.join('/tmp', decodedName + '.zip');
            var output = fs.createWriteStream(zipPath);
            var archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });

            output.on('close', function () {
                res.download(zipPath, decodedName + '.zip', (err) => {
                    if (err) {
                        console.error('Error downloading file:', err);
                        return next(err);
                    }
                });
            });

            res.on('finish', () => {
                fs.unlink(zipPath, (err) => {
                    if (err) {
                        console.error('Error deleting the zip file:', err);
                    } else {
                        console.log('Zip file deleted successfully');
                    }
                });

                file.incDownloads();
            });

            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    console.warn(err);
                } else {
                    throw err;
                }
            });

            archive.on('error', function (err) {
                throw err;
            });

            archive.pipe(output);
            archive.directory(filePath, false);

            archive.finalize();
        } else {
            res.download(filePath, decodedName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    return next(err);
                }

                file.incDownloads();
            });
        }

    } catch (err) {
        console.error('Error getting file:', err);
        res.status(500).json({ message: 'Error getting file', error: err.message });
    }
});

export default router;
