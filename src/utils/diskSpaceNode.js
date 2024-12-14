import { exec } from 'child_process';
import os from "os";
import fs from "fs";
import { promisify } from 'util';
import numeral from 'numeral';

const execPromise = promisify(exec);
const accessPromise = promisify(fs.access);

/**
 * Retrieve disks list.
 *
 * @param {string} directory - The directory to check
 * @returns {Promise<string[]>} - A promise that resolves with the list of drives
 */
export async function drives(directory) {
    try {
        //await accessPromise(directory, fs.F_OK);
        await accessPromise(directory, fs.constants.R_OK)
        let command;
        switch (os.platform().toLowerCase()) {
            case 'darwin':
                command = `df -kl ${directory} | awk '{print $1}'`;
                break;
            case 'linux':
            default:
                command = `df ${directory} | awk '{print $1}'`;
                break;
        }
        const drives = await getDrives(command);
        return drives;
    } catch (err) {
        throw new Error(`Could not access directory, error: ${err.code}`);
    }
}

/**
 * Execute a command to retrieve disks list.
 *
 * @param {string} command - The command to execute
 * @returns {Promise<string[]>} - A promise that resolves with the list of drives
 */
async function getDrives(command) {
    try {
        const { stdout } = await execPromise(command);
        let drives = stdout.split('\n');

        drives.splice(0, 1);
        drives.splice(-1, 1);

        // Removes ram drives
        drives = drives.filter((item) => item !== 'none');
        return drives;
    } catch (err) {
        throw new Error(`Error executing command: ${err.message}`);
    }
}

/**
 * Retrieve space information about one drive.
 *
 * @param drive
 * @param callback
 */
export function driveDetail(drive, callback) {
    detail(drive, callback);
};

/**
 * Retrieve space information about each drive.
 *
 * @param {string[]} drives - The list of drives to check
 * @returns {Promise<object[]>} - A promise that resolves with the details of each drive
 */
export async function drivesDetail(drives) {
    try {
        const drivesDetail = [];
        for (const drive of drives) {
            const detailResult = await detail(drive);
            drivesDetail.push(detailResult);
        }
        return drivesDetail;
    } catch (err) {
        throw new Error(`Error retrieving drives detail: ${err.message}`);
    }
}

/**
 * Retrieve space information about one drive.
 *
 * @param {string} drive - The drive to check
 * @returns {Promise<object>} - A promise that resolves with the drive details
 */
async function detail(drive) {
    try {
        const used = await getDetail(`df | grep ${drive} | awk '{print $3}'`);
        const available = await getDetail(`df | grep ${drive} | awk '{print $4}'`);
        const mountpoint = await getDetailNaN(`df | grep ${drive} | awk '{print $6}'`);

        let results = {
            used: numeral(used).value(),
            available: numeral(available).value(),
            mountpoint: mountpoint.trim(),
            freePer: numeral((available / (used + available)) * 100).format('0'),
            usedPer: numeral((used / (used + available)) * 100).format('0'),
            drive: drive,
        };
        results.total = numeral(results.used + results.available).format('0.00 b');

        return results;
    } catch (err) {
        throw new Error(`Error retrieving drive details: ${err.message}`);
    }
}

/**
 * Execute a command to retrieve drive details.
 *
 * @param {string} command - The command to execute
 * @returns {Promise<number>} - A promise that resolves with the command output
 */
function getDetail(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(parseInt(stdout.trim()) * 1024);
            }
        });
    });
}

/**
 * Execute a command to retrieve drive details that may not be a number.
 *
 * @param {string} command - The command to execute
 * @returns {Promise<string>} - A promise that resolves with the command output
 */
function getDetailNaN(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}