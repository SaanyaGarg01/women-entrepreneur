const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('./models/User');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    family: 4 // IPv4 to avoid DNS issues
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Home Route
app.get('/', (req, res) => {
    res.send("👋 Welcome to the Women Entrepreneurs Platform!<br><a href='/signup'>Signup</a> | <a href='/login'>Login</a>");
});

// Signup Page
app.get('/signup', (req, res) => {
    res.render("signup");
});

// Login Page
app.get('/login', (req, res) => {
    res.render("login");
});

// Signup Handler (Only create user if email is sent successfully)
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.send("User already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Setup email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: `"Women Entrepreneurs Platform" <${process.env.EMAIL}>`,
        to: email,
        subject: "🎉 Welcome to Women Entrepreneurs Platform!",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome, ${name}!</h2>
                <p>Thank you for signing up on the <b>Women Entrepreneurs Platform</b>.</p>
                <p>We're excited to have you join a community of passionate women!</p>
                <br>
                <p style="color: gray; font-size: 12px;">This is an automated email, please do not reply.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {
            console.error("❌ Email error:", err);
            return res.send("Signup failed: Could not send confirmation email.");
        } else {
            console.log("✅ Email sent:", info.response);

            // Save user only if email is sent
            const user = new User({ name, email, password: hashedPassword });
            await user.save();

            res.send("Signup successful! Confirmation email sent.");
        }
    });
});

// Login Handler
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Incorrect password.");

    res.send("Login successful!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
