import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function createOTPTable() {
  console.log('📧 Creating email_otps table...');
  try {
    const connection = await pool.getConnection();

    // Drop table if exists
    await connection.execute('DROP TABLE IF EXISTS `email_otps`');

    // Create table with AUTO_INCREMENT
    await connection.execute(`
      CREATE TABLE \`email_otps\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`email\` varchar(255) NOT NULL,
        \`otp\` varchar(6) NOT NULL,
        \`is_used\` tinyint(1) NOT NULL DEFAULT 0,
        \`expires_at\` datetime NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_email_created\` (\`email\`, \`created_at\`),
        KEY \`idx_email_used\` (\`email\`, \`is_used\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    connection.release();
    console.log('✅ email_otps table created successfully with AUTO_INCREMENT!');
  } catch (error: any) {
    console.error('❌ Error creating email_otps table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createOTPTable();
}

