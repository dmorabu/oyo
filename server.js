require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = 4000;
const cookieParser = require('cookie-parser');

// const Users = require('./models/User'); // Assuming Users model is already defined
// const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is properly loaded from your environment variables


// MongoDB connection

mongoURI ="mongodb+srv://dtailor:iaMRe8QXcMfbHzOW@Cluster0.tspdp.mongodb.net/user_credentials?retryWrites=true&w=majority&appName=Cluster0";
 // Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB Atlas successfully.");
}).catch((error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});


const userSchema = new mongoose.Schema({
  email: {type: String, required:true},
  pass: {type: String, required:true}
},{ versionKey: false });

// Function to save token to cookie
const saveTokenToCookie = (res, token) => {
  res.cookie('token', token, {
    maxAge: 3600000, // 1 hour in milliseconds
    httpOnly: true,  // Prevents JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (only over HTTPS)
    sameSite: 'Strict', // Cookies only sent in a first-party context
    path: '/', // Available to all routes
  });
};

const Users = mongoose.model("Users", userSchema,"Users");
const app = express();
// app.use(cors());
app.use(bodyParser.json());

// Login route
// const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5000', // React frontend URL
  credentials: true, // Allow cookies to be sent
}));
const JWT_SECRET = "07da40547e8307eb2a3504f9ad2aec8e5e975a3ec17f64c3d399a4b346849721d0b5d6e6eb69e24c65975e868e090012e9241f78364831d134e4428964fefcb2";

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  
  try {
    // Find the user in the database
    const user = await Users.findOne({ email });
    console.log(user);
    
    if (!user) {
      console.log("User not found");
      return res.status(201).json({ success: false, message: "No user exists" });
    }

    // Compare the password with the hash stored in the database
    const isMatch = await bcrypt.compare(password, user.pass);
    console.log(typeof password);
    console.log(typeof user.pass);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(201).json({ success: false, message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token:', token);
    
    // Save token in cookie
    saveTokenToCookie(res, token);
    
    // If login is successful, return a success message
    res.json({ success: true, message: "Login successful" });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Middleware to verify JWT token for protected routes
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Store decoded user data for further use
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

// Home route (protected)
app.get("/home", verifyToken, (req, res) => {
  res.json({ success: true, message: "Welcome to the home page", user: req.user });
});


app.post('/signup', async (req, res) => {
  console.log("reached here");
  const { email, password } = req.body;

  // Check if the email is already taken
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return res.status(500).json({ message: 'Email is already taken.' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new Users({
    email,
    pass: hashedPassword, // Save the hashed password
  });

  try {
    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Start the server
// const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
