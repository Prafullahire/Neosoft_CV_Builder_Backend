const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const user = encodeURIComponent(process.env.DB_USER); 
    const pass = encodeURIComponent(process.env.DB_PASS);
    const dbName = process.env.DB_NAME;
    const host = process.env.DB_HOST;

    const mongoURI = `mongodb+srv://${user}:${pass}@${host}/${dbName}?retryWrites=true&w=majority`;
    const conn = await mongoose.connect(mongoURI); 

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
