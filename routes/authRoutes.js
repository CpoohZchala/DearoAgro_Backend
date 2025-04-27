const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();
const router = express.Router();
router.use(cookieParser()); 


// User Registration
router.post('/signup', async (req, res) => {
    const { fullName, mobileNumber, password, userType } = req.body;

    try {
        // Check if the user already exists
        let userExists = await User.findOne({ mobileNumber });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this mobile number.' });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // Hash the password
        console.log('Password before hashing:', password); // Debugging log
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword); // Debugging log
        
        // Create new user
        const user = new User({ fullName, mobileNumber, password: hashedPassword, userType });

        // Save the user in the database
        await user.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
});



// User Login
router.post('/signin', async (req, res) => {
    const { mobileNumber, password } = req.body;

    try {
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        console.log('User found:', user); // Debugging log
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch); // Debugging log
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            userType: user.userType, 
            userId: user._id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// User Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});


// Get current user profile
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
