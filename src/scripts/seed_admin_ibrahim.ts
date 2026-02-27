import mongoose from 'mongoose';
import User from '../models/User';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yod-elazig';

async function seedAdmin() {
  await mongoose.connect(MONGO_URI);
  const email = 'abdellah@yod-elazig.org';
  const password = 'Admin@123456';
  const name = 'عبداللاه شيخ';
  const role = 'admin';

  // Check if user already exists
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin user already exists:', email);
    process.exit(0);
  }

  const user = new User({
    name,
    email,
    password,
    role,
    isActive: true,
  });
  await user.save();
  console.log('Admin user created:', email);
  process.exit(0);
}

seedAdmin().catch(e => { console.error(e); process.exit(1); });
