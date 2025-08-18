const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const app = express();
const formRoutes = require("./routes/cultivationRoutes");
const cropRoutes = require("./routes/cropRoutes");  
const expenseRoutes = require("./routes/expenseRoute");  
const financialIRoutes = require("./routes/financialIRoutes");  
const technicalIRoutes = require("./routes/technicalIRoutes");
const farmerRoutes = require('./routes/farmerRoutes'); 
const superAdminRoutes = require('./routes/superAdminRoutes');
const groupRoutes = require('./routes/groupRoutes'); 
const soilTestReportRoutes= require('./routes/soilTestReportRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const marketingOfficerRoutes = require('./routes/marketingOfficerRoutes');
const stockRoutes = require('./routes/stockRoutes');
const newCropRoutes = require ('./routes/newCropRoutes')





// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://dearoagro-admin-dashboard.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use("/api", formRoutes);
app.use("/api", cropRoutes);
app.use("/api", expenseRoutes);
app.use("/api", financialIRoutes);
app.use("/api", technicalIRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/superAdminRoutes', superAdminRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', soilTestReportRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/officers', marketingOfficerRoutes);
app.use('/api/stocks', stockRoutes);
app.use("/api/crops", newCropRoutes);


app.use('/uploads', express.static('uploads')); 


// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
