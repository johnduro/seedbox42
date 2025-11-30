import { exec } from 'child_process';
import fs from "fs";
import { promisify } from 'util';
import numeral from 'numeral';

const execPromise = promisify(exec);
const accessPromise = promisify(fs.access);

/**
 * Retrieve disk usage for a specific directory directly.
 *
 * @param {string} directory - The directory to check
 * @returns {Promise<object>} - A promise that resolves with the disk usage details
 */
export async function getDiskUsage(directory) {
    try {
        await accessPromise(directory, fs.constants.R_OK);
        // Use -P for POSIX portability (prevents line wrapping) and -k for 1K blocks
        const { stdout } = await execPromise(`df -kP "${directory}"`);
        const lines = stdout.trim().split('\n');
        
        // Expecting at least 2 lines: header and data
        if (lines.length < 2) {
            throw new Error(`Unexpected df output for ${directory}`);
        }

        // Parse the last line (in case of multiple lines, the last one is usually the mount point)
        const lastLine = lines[lines.length - 1];
        const parts = lastLine.split(/\s+/);

        // df -P output columns: Filesystem, 1024-blocks, Used, Available, Capacity, Mounted on
        if (parts.length < 6) {
            throw new Error(`Unexpected df output format: ${lastLine}`);
        }

        const total = parseInt(parts[1], 10) * 1024; // Convert 1K blocks to bytes
        const used = parseInt(parts[2], 10) * 1024;
        const available = parseInt(parts[3], 10) * 1024;

        return {
            total: numeral(total).format('0.00 b'),
            used: used,
            available: available,
            freePer: Math.round((available / total) * 100),
            usedPer: Math.round((used / total) * 100),
            mountpoint: parts[5]
        };
    } catch (err) {
        throw new Error(`Error retrieving disk usage: ${err.message}`);
    }
}