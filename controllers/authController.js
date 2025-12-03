const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { username, email, password, contactNumber } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            contactNumber,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { OAuth2Client } = require('google-auth-library');


const googleAuth = async (req, res) => {
    const { tokenId } = req.body; // ID token from client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        // Find existing user by email or create new one
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                username: name,
                email,
                password: googleId, 
                contactNumber: '',
                googleId,
                avatar: picture,
            });
        }
        const token = generateToken(user._id);
        res.json({ _id: user._id, username: user.username, email: user.email, token });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

module.exports = { registerUser, authUser, googleAuth };
