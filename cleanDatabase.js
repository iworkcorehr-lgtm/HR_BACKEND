const mongoose = require('mongoose');
require('dotenv').config();

// Import all your models
const User = require('./src/models/User');
const Company = require('./src/models/Company');
// Add any other models you have e.g:
// const Invitation = require('./src/models/Invitation');

const cleanDatabase = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL || process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Delete all documents from each collection
        const userResult = await User.deleteMany({});
        console.log(`✅ Deleted ${userResult.deletedCount} users`);

        const companyResult = await Company.deleteMany({});
        console.log(`✅ Deleted ${companyResult.deletedCount} companies`);

        // Add more models here as needed
        // const inviteResult = await Invitation.deleteMany({});
        // console.log(`✅ Deleted ${inviteResult.deletedCount} invitations`);

        console.log('🎉 Database cleaned successfully!');
    } catch (err) {
        console.error('❌ Error cleaning database:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
        process.exit(0);
    }
};

cleanDatabase();