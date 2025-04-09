const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require("../utils/redisClient")
const User = require("../models/user")

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id ,  role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
};

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Create tokens
        const accessToken = generateAccessToken(savedUser);
        const refreshToken = generateRefreshToken(savedUser);

        // Save refresh token in DB
        savedUser.refreshToken = refreshToken;
        await savedUser.save();

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // only on HTTPS in prod
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: "User created successfully",
            accessToken
        });

    } catch (error) {
        console.error("Signup error: ", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Update refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Send refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await redisClient.set(user._id.toString(), refreshToken); // store refresh token against user ID

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getProfile = async (req ,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.log('Profile Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.refreshAccessToken = async (req,res) => {
    try{

        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: "No token provided" });

        jwt.verify(token,  process.env.REFRESH_TOKEN_SECRET , async (err , decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });

            const isBlacklisted = await redisClient.get(token);
            if (isBlacklisted === 'blacklisted') {
                return res.status(403).json({ message: 'Invalid refresh token (blacklisted)' });
            }
            
            const userId = decoded.id;

            const storedToken = await redisClient.get(userId);

            if (!storedToken || storedToken !== token ) {
                 return res.status(403).json({ message: "Invalid refresh token" });
            }


            const newAccessToken = jwt.sign(
                { id: decoded.id, role: decoded.role },
                 process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            res.status(200).json({
                success: true,
                accessToken: newAccessToken
              });
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.logout = async (req ,res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(400).json({ message: "Refresh token not found in cookies"  });
        }

        // Add token to blackList
        await redisClient.set(refreshToken, 'blacklisted', 'EX', 7 * 24 * 60 * 60);

        // Clear the cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

        return res.status(200).json({ message: 'Logout successful' })
    }
    catch(err) {
        console.log("Logout Error:", err);
        return res.status(500).json({ message : 'something went wrong',
                        error : err
        })
    }
}
