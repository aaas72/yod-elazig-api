import mongoose from 'mongoose';
import { Student } from '../src/models';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Migration Script for Student Data
 *
 * This script migrates existing student data to the new advanced membership system:
 * 1. Converts isActive field to appropriate status values
 * 2. Adds default membershipType for existing members
 * 3. Sets applicationDate for existing members
 * 4. Preserves all existing data
 */

interface OldStudentData {
  _id: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  enrollmentDate?: Date;
}

async function migrateStudentsData() {
  try {
    console.log('🚀 Starting Student Data Migration...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yod_elazig';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all existing students
    const existingStudents = await Student.find({}).select('_id isActive createdAt enrollmentDate status membershipType applicationDate');
    console.log(`📊 Found ${existingStudents.length} existing students`);

    if (existingStudents.length === 0) {
      console.log('ℹ️  No students found. Migration not needed.');
      return;
    }

    let migratedCount = 0;
    let skipperCount = 0;

    for (const student of existingStudents) {
      try {
        // Skip if already migrated (has status field)
        if (student.status && student.status !== 'pending') {
          skipperCount++;
          continue;
        }

        // Prepare update data
        const updateData: any = {};

        // Convert isActive to status
        if (student.isActive === true) {
          updateData.status = 'active';
        } else if (student.isActive === false) {
          updateData.status = 'suspended';
        } else {
          updateData.status = 'pending'; // Default for undefined
        }

        // Set default membershipType if not exists
        if (!student.membershipType) {
          updateData.membershipType = 'regular';
        }

        // Set applicationDate if not exists
        if (!student.applicationDate) {
          updateData.applicationDate = student.enrollmentDate || student.createdAt;
        }

        // Update the student
        await Student.updateOne(
          { _id: student._id },
          { $set: updateData }
        );

        migratedCount++;

        // Log progress every 10 students
        if (migratedCount % 10 === 0) {
          console.log(`⚡ Migrated ${migratedCount} students...`);
        }

      } catch (error) {
        console.error(`❌ Error migrating student ${student._id}:`, error);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} students`);
    console.log(`⏭️  Skipped (already migrated): ${skipperCount} students`);
    console.log(`📊 Total processed: ${existingStudents.length} students`);

    // Validate migration
    await validateMigration();

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

/**
 * Validate the migration by checking data consistency
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration...');

  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Status distribution after migration:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} students`);
    });

    const membershipTypeStats = await Student.aggregate([
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Membership type distribution:');
    membershipTypeStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} students`);
    });

    // Check for students without required fields
    const incompleteStudents = await Student.countDocuments({
      $or: [
        { status: { $exists: false } },
        { membershipType: { $exists: false } },
        { applicationDate: { $exists: false } }
      ]
    });

    if (incompleteStudents > 0) {
      console.warn(`⚠️  Found ${incompleteStudents} students with incomplete migration`);
    } else {
      console.log('✅ All students have been successfully migrated');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

/**
 * Rollback function (in case something goes wrong)
 */
async function rollbackMigration() {
  console.log('🔄 Rolling back migration...');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yod_elazig');

    // Reset status based on isActive
    const result = await Student.updateMany(
      {},
      {
        $unset: {
          status: "",
          membershipType: "",
          applicationDate: "",
          reviewedBy: "",
          reviewedAt: "",
          reviewNote: ""
        }
      }
    );

    console.log(`✅ Rollback completed. Reset ${result.modifiedCount} students`);

  } catch (error) {
    console.error('❌ Rollback failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'rollback') {
    rollbackMigration()
      .then(() => {
        console.log('🏁 Rollback completed');
        process.exit(0);
      })
      .catch(error => {
        console.error('💥 Rollback failed:', error);
        process.exit(1);
      });
  } else {
    migrateStudentsData()
      .then(() => {
        console.log('🏁 Migration completed successfully');
        process.exit(0);
      })
      .catch(error => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
      });
  }
}

export { migrateStudentsData, rollbackMigration, validateMigration };