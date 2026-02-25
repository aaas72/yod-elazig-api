// scripts/listPrograms.js
require('dotenv').config({ path: './.env' });
const connectDB = require('../src/config/db').default;
const Program = require('../src/models/Program').default;

(async () => {
  await connectDB();
  const programs = await Program.find({});
  console.log(programs.map(p => ({
    id: p._id,
    title: p.title,
    status: p.status,
    category: p.category,
    tags: p.tags,
    isPublished: p.isPublished,
    startDate: p.startDate,
    endDate: p.endDate
  })));
  process.exit();
})();
