require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/delivery');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/merchant', authRoutes);
app.use('/merchant/products', productRoutes);
app.use('/merchant/orders', orderRoutes);
app.use('/merchant/delivery', deliveryRoutes);

app.get('/', (req, res) => {
  res.json({ message: '抵食私房商家端API服务运行中' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
