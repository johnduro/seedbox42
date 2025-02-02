import jwt from "jsonwebtoken";
import User from "../models/User.js";

function verifyToken(token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
}

export default {
    signToken: (objectToEncode, secret, duration) => {
        const token = jwt.sign(objectToEncode, secret, {
            expiresIn: duration
        });

        return token;
    },

    getUserFromToken: async (token, secret) => {
        const decoded = await verifyToken(token, secret);
        if (!decoded) {
            throw new Error('Unauthorized');
            //            return res.status(403).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(decoded._id).exec();
        if (!user) {
            throw new Error('Unauthorized');
            //            return res.status(403).json({ message: 'Unauthorized' });
        }

        return user;
    },

    getDecodedToken: async (token, secret) => {
        const decoded = await verifyToken(token, secret);
        if (!decoded) {
            throw new Error('Unauthorized');
        }

        return decoded;
    }
}