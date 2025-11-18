import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function createAssignmentTables() {
  try {
    const connection = await pool.getConnection();
    
    console.log('📋 Creating assignment-related tables...\n');

    // Read SQL file from main schema
    const sqlPath = path.join(__dirname, '../../database/icas_cmu_hub.sql');
    const schemaSQL = fs.readFileSync(sqlPath, 'utf-8');

    // Extract only assignment-related statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        (stmt.toLowerCase().startsWith('create table `club_assignments`') ||
         stmt.toLowerCase().startsWith('create table `assignment_submissions`') ||
         stmt.toLowerCase().startsWith('create table `assignment_attachments`') ||
         stmt.toLowerCase().startsWith('create table `assignment_comments`') ||
         stmt.toLowerCase().startsWith('alter table `club_assignments`') ||
         stmt.toLowerCase().startsWith('alter table `assignment_submissions`') ||
         stmt.toLowerCase().startsWith('alter table `assignment_attachments`') ||
         stmt.toLowerCase().startsWith('alter table `assignment_comments`') ||
         stmt.toLowerCase().startsWith('drop table if exists `club_assignments`') ||
         stmt.toLowerCase().startsWith('drop table if exists `assignment_submissions`') ||
         stmt.toLowerCase().startsWith('drop table if exists `assignment_attachments`') ||
         stmt.toLowerCase().startsWith('drop table if exists `assignment_comments`'))
      );

    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          await connection.execute(statement);
        } catch (error: any) {
          // Ignore "Table already exists" errors
          if (error.code !== 'ER_TABLE_EXISTS_ERROR' && !error.message.includes('already exists')) {
            console.error('Error executing statement:', error.message);
          }
        }
      }
    }

    connection.release();
    console.log('✅ Assignment tables created successfully!');
    console.log('   - club_assignments');
    console.log('   - assignment_submissions');
    console.log('   - assignment_attachments');
    console.log('   - assignment_comments');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating assignment tables:', error);
    process.exit(1);
  }
}

createAssignmentTables();

