const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SuperAdmin = require('../models/SuperAdmin'); // Import the SuperAdmin model
const Farmer = require('../models/Farmer'); // Import the Farmer model
const MarketingOfficer = require('../models/MarketingOfficer'); // Import the MarketingOfficer model
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();
const router = express.Router();
router.use(cookieParser()); 


// User Registration
router.post('/signup', async (req, res) => {
    const { fullName, mobileNumber, password, userType } = req.body;

    try {
        if (userType === 'Marketing Officer') {
            // Check if the Marketing Officer already exists
            let marketingOfficerExists = await MarketingOfficer.findOne({ mobileNumber });
            if (marketingOfficerExists) {
                return res.status(400).json({ message: 'Marketing Officer already exists with this mobile number.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new Marketing Officer
            const marketingOfficer = new MarketingOfficer({ fullName, mobileNumber, password: hashedPassword });

            // Save the Marketing Officer in the database
            await marketingOfficer.save();
            return res.status(201).json({ message: 'Marketing Officer registered successfully.' });
        }

        if (userType === 'Farmer') {
            // Check if the Farmer already exists
            let farmerExists = await Farmer.findOne({ mobileNumber });
            if (farmerExists) {
                return res.status(400).json({ message: 'Farmer already exists with this mobile number.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new Farmer
            const farmer = new Farmer({ fullName, mobileNumber, password: hashedPassword });

            // Save the Farmer in the database
            await farmer.save();
            return res.status(201).json({ message: 'Farmer registered successfully.' });
        }

        if (userType === 'Super Admin') {
            // Check if the Super Admin already exists
            let superAdminExists = await SuperAdmin.findOne({ mobileNumber });
            if (superAdminExists) {
                return res.status(400).json({ message: 'Super Admin already exists with this mobile number.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new Super Admin
            const superAdmin = new SuperAdmin({ fullName, mobileNumber, password: hashedPassword });

            // Save the Super Admin in the database
            await superAdmin.save();
            return res.status(201).json({ message: 'Super Admin registered successfully.' });
        }

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
    console.log('Sign-in request received:', { mobileNumber, userType: req.body.userType }); // Debugging log

    try {
        if (!req.body.userType) {
            return res.status(400).json({ message: 'User type is required for sign-in.' });
        }

        if (req.body.userType === 'Super Admin') {
            const superAdmin = await SuperAdmin.findOne({ mobileNumber });

            if (!superAdmin) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, superAdmin.password);
            console.log('Password comparison result for Super Admin:', isMatch); // Debugging log
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const token = jwt.sign(
                { id: superAdmin._id, userType: 'Super Admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                userType: 'Super Admin',
                userId: superAdmin._id
            });
        }

        if (req.body.userType === 'Farmer') {
            const farmer = await Farmer.findOne({ mobileNumber });
            console.log('Farmer fetched from DB:', farmer); // Debugging log
            if (!farmer) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, farmer.password);
            console.log('Password comparison result for Farmer:', isMatch); // Debugging log
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const token = jwt.sign(
                { id: farmer._id, userType: 'Farmer' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                userType: 'Farmer',
                userId: farmer._id
            });
        }

        if (req.body.userType === 'Marketing Officer') {
            const marketingOfficer = await MarketingOfficer.findOne({ mobileNumber });
            console.log('Marketing Officer fetched from DB:', marketingOfficer); // Debugging log
            if (!marketingOfficer) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, marketingOfficer.password);
            console.log('Password comparison result for Marketing Officer:', isMatch); // Debugging log
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const token = jwt.sign(
                { id: marketingOfficer._id, userType: 'Marketing Officer' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                userType: 'Marketing Officer',
                userId: marketingOfficer._id
            });
        }

        const user = await User.findOne({ mobileNumber });
        console.log('User fetched from DB:', user); // Debugging log
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result for User:', isMatch); // Debugging log
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
