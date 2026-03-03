import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

import mongoose from 'mongoose';
import { User, News, Event } from '../src/models';
import { ROLES } from '../src/constants';
import connectDB from '../src/config/db';

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // ── Clear existing data ────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      News.deleteMany({}),
      Event.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data');

    // ── Create Super Admin ─────────────────────────────
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@yod-elazig.org',
      password: 'Admin@123456',
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // ── Create Editor ──────────────────────────────────
    const editor = await User.create({
      name: 'Content Editor',
      email: 'editor@yod-elazig.org',
      password: 'Editor@123456',
      role: ROLES.EDITOR,
      isActive: true,
    });
    console.log(`✅ Editor created: ${editor.email}`);

    // ── Create Sample News ─────────────────────────────
    const newsArticles = await News.create([
      {
        title: 'Welcome to YOD Elazig',
        content:
          'We are excited to launch the Youth Organization for Development in Elazig. Our mission is to empower students and youth in the community through programs, events, and resources.',
        summary: 'Official launch announcement of YOD Elazig platform.',
        category: 'Announcement',
        author: superAdmin._id,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
        tags: ['announcement', 'launch', 'community'],
      },
      {
        title: 'Volunteer Registration Now Open',
        content:
          'Join our team of dedicated volunteers! We have various roles available for students who want to make a difference in their community. Apply now and become part of the YOD family.',
        summary: 'Volunteer positions are now available.',
        category: 'Volunteering',
        author: editor._id,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['volunteer', 'registration', 'opportunity'],
      },
      {
        title: 'Upcoming Workshop: Leadership Skills',
        content:
          'We are organizing a comprehensive workshop on leadership skills for university students. The workshop will cover communication, team management, and project planning.',
        summary: 'Leadership skills workshop for students.',
        category: 'Education',
        author: editor._id,
        isPublished: false,
        tags: ['workshop', 'leadership', 'education'],
      },
    ]);
    console.log(`✅ Created ${newsArticles.length} news articles`);

    // ── Create Sample Events ───────────────────────────
    const now = new Date();
    const events = await Event.create([
      {
        title: 'Community Cultural Night',
        description:
          'An evening celebrating cultural diversity with food, music, and performances from students of different backgrounds.',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: 'Firat University Main Hall',
        category: 'Cultural',
        capacity: 200,
        organizer: superAdmin._id,
        isPublished: true,
        isFeatured: true,
        registrationDeadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Turkish Language Workshop',
        description:
          'Free Turkish language classes for international students. Beginner to intermediate levels available.',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'YOD Elazig Office',
        category: 'Education',
        capacity: 30,
        organizer: editor._id,
        isPublished: true,
        registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // ── Summary ────────────────────────────────────────
    console.log('\n🎉 Database seeded successfully!');
    console.log('─'.repeat(40));
    console.log('Credentials:');
    console.log('  Super Admin: admin@yod-elazig.org / Admin@123456');
    console.log('  Editor:      editor@yod-elazig.org / Editor@123456');
    console.log('─'.repeat(40));
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
