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
        // Validate required fields
        if (!username || !email || !password) {
            console.warn('Register: Missing required fields', { username: !!username, email: !!email, password: !!password });
            return res.status(400).json({ 
                message: 'Validation error',
                errors: [
                    !username && { field: 'username', message: 'Username is required' },
                    !email && { field: 'email', message: 'Email is required' },
                    !password && { field: 'password', message: 'Password is required' }
                ].filter(Boolean)
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.warn('Register: User already exists', { email });
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            username,
            email,
            password,
            contactNumber,
        });

        if (user) {
            console.log('Register: User created successfully', { userId: user._id, email });
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.error('Register: User creation failed');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map((key) => ({
                field: key,
                message: error.errors[key].message,
            }));
            console.error('Register ValidationError:', errors);
            return res.status(400).json({ message: 'Validation error', errors });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            console.error('Register: Duplicate key error', { field, value: error.keyValue[field] });
            return res.status(400).json({ message: `${field} already exists` });
        }

        console.error('Register: Server error', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            console.warn('Login: Missing email or password');
            return res.status(400).json({ 
                message: 'Validation error',
                errors: [
                    !email && { field: 'email', message: 'Email is required' },
                    !password && { field: 'password', message: 'Password is required' }
                ].filter(Boolean)
            });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log('Login: Successful', { userId: user._id, email });
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.warn('Login: Invalid credentials', { email });
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login: Server error', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const { OAuth2Client } = require('google-auth-library');


const googleAuth = async (req, res) => {
    const { tokenId } = req.body; // ID token from client
    
    if (!tokenId) {
        console.warn('Google Auth: Missing tokenId');
        return res.status(400).json({ message: 'Google token is required' });
    }

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
            console.log('Google Auth: New user created', { userId: user._id, email });
        } else {
            console.log('Google Auth: Existing user logged in', { userId: user._id, email });
        }
        
        const token = generateToken(user._id);
        res.json({ _id: user._id, username: user.username, email: user.email, token });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map((key) => ({
                field: key,
                message: error.errors[key].message,
            }));
            console.error('Google Auth ValidationError:', errors);
            return res.status(400).json({ message: 'Validation error', errors });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            console.error('Google Auth: Duplicate key error', { field });
            return res.status(400).json({ message: `${field} already exists` });
        }

        console.error('Google Auth: Failed', error.message);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

module.exports = { registerUser, authUser, googleAuth };
