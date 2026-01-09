import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js'; // We will create this small file below
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // 1. Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Insert Users and get the Admin ID
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // 3. Add the Admin ID to every product (so we know who created it)
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    // 4. Insert Products
    await Product.insertMany(sampleProducts);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check command line arguments to decide whether to import or destroy
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}