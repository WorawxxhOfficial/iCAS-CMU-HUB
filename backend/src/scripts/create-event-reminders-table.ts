import pool from '../config/database';

async function createEventRemindersTable() {
  console.log('⏰ Creating event_reminders table...');
  try {
    const connection = await pool.getConnection();
    
    // Drop table if exists
    await connection.execute('DROP TABLE IF EXISTS `event_reminders`');
    
    // Create table
    await connection.execute(`
      CREATE TABLE \`event_reminders\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`event_id\` int(11) NOT NULL,
        \`reminder_sent_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`unique_event_reminder\` (\`event_id\`, \`reminder_sent_at\`),
        KEY \`idx_event_id\` (\`event_id\`),
        KEY \`idx_reminder_sent_at\` (\`reminder_sent_at\`),
        CONSTRAINT \`event_reminders_ibfk_1\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('✅ event_reminders table created successfully!');
  } catch (error: any) {
    console.error('❌ Error creating event_reminders table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  createEventRemindersTable();
}

