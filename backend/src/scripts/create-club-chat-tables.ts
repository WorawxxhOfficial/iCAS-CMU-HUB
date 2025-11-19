import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

async function createClubChatTables() {
  try {
    const connection = await pool.getConnection();
    
    console.log('📋 Creating club chat tables...\n');

    // Create club_chat_messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`club_chat_messages\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`club_id\` int(11) NOT NULL,
        \`user_id\` int(11) NOT NULL,
        \`encrypted_message\` text NOT NULL,
        \`status\` enum('sending','sent','failed') NOT NULL DEFAULT 'sent',
        \`is_edited\` tinyint(1) NOT NULL DEFAULT 0,
        \`is_unsent\` tinyint(1) NOT NULL DEFAULT 0,
        \`deleted_by_sender\` tinyint(1) NOT NULL DEFAULT 0,
        \`reply_to_message_id\` int(11) NULL DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        \`deleted_at\` timestamp NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_club_id\` (\`club_id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_created_at\` (\`created_at\`),
        KEY \`idx_deleted_at\` (\`deleted_at\`),
        KEY \`idx_reply_to_message_id\` (\`reply_to_message_id\`),
        CONSTRAINT \`club_chat_messages_ibfk_1\` FOREIGN KEY (\`club_id\`) REFERENCES \`clubs\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`club_chat_messages_ibfk_2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`club_chat_messages_ibfk_3\` FOREIGN KEY (\`reply_to_message_id\`) REFERENCES \`club_chat_messages\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Add is_unsent column to existing table if it doesn't exist
    try {
      // Check if column exists first
      const [columns] = await connection.execute<RowDataPacket[]>(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'club_chat_messages' 
         AND COLUMN_NAME = 'is_unsent'`
      );
      
      if (columns.length === 0) {
        await connection.execute(`
          ALTER TABLE \`club_chat_messages\`
          ADD COLUMN \`is_unsent\` tinyint(1) NOT NULL DEFAULT 0
        `);
        console.log('✅ Added is_unsent column');
      } else {
        console.log('✅ is_unsent column already exists');
      }
    } catch (error: any) {
      console.warn('⚠️  Could not add is_unsent column:', error.message);
    }

    // Add deleted_by_sender column to existing table if it doesn't exist
    try {
      const [columns] = await connection.execute<RowDataPacket[]>(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'club_chat_messages' 
         AND COLUMN_NAME = 'deleted_by_sender'`
      );
      
      if (columns.length === 0) {
        await connection.execute(`
          ALTER TABLE \`club_chat_messages\`
          ADD COLUMN \`deleted_by_sender\` tinyint(1) NOT NULL DEFAULT 0
        `);
        console.log('✅ Added deleted_by_sender column');
      } else {
        console.log('✅ deleted_by_sender column already exists');
      }
    } catch (error: any) {
      console.warn('⚠️  Could not add deleted_by_sender column:', error.message);
    }

    // Add reply_to_message_id column to existing table if it doesn't exist
    try {
      const [columns] = await connection.execute<RowDataPacket[]>(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'club_chat_messages' 
         AND COLUMN_NAME = 'reply_to_message_id'`
      );
      
      if (columns.length === 0) {
        await connection.execute(`
          ALTER TABLE \`club_chat_messages\`
          ADD COLUMN \`reply_to_message_id\` int(11) NULL DEFAULT NULL
        `);
        await connection.execute(`
          ALTER TABLE \`club_chat_messages\`
          ADD KEY \`idx_reply_to_message_id\` (\`reply_to_message_id\`)
        `);
        await connection.execute(`
          ALTER TABLE \`club_chat_messages\`
          ADD CONSTRAINT \`club_chat_messages_ibfk_3\` 
          FOREIGN KEY (\`reply_to_message_id\`) 
          REFERENCES \`club_chat_messages\` (\`id\`) 
          ON DELETE SET NULL
        `);
        console.log('✅ Added reply_to_message_id column');
      } else {
        console.log('✅ reply_to_message_id column already exists');
      }
    } catch (error: any) {
      console.warn('⚠️  Could not add reply_to_message_id column:', error.message);
    }

    connection.release();
    console.log('✅ Club chat tables created successfully!');
    console.log('   - club_chat_messages');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating club chat tables:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.sqlMessage) {
      console.error('SQL error:', error.sqlMessage);
    }
    process.exit(1);
  }
}

createClubChatTables();

