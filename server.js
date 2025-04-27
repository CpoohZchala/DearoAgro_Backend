const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const app = express();
const formRoutes = require("./routes/cultivationRoutes");
const cropRoutes = require("./routes/cropRoutes");  
const expenseRoutes = require("./routes/expenseRoute");  
const generalRoutes = require("./routes/generalRoutes");  
const financialIRoutes = require("./routes/generalRoutes");  
const technicalIRoutes = require("./routes/technicalIRoutes");
const farmerRoutes = require('./routes/farmerRoutes'); 
const superAdminRoutes = require('./routes/superAdminRoutes');


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use("/api", formRoutes);
app.use("/api", cropRoutes);
app.use("/api", expenseRoutes);
app.use("/api", generalRoutes);
app.use("/api", financialIRoutes);
app.use("/api", technicalIRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/superAdminRoutes', superAdminRoutes);



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
