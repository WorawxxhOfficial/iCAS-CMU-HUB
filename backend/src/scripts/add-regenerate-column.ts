import pool from '../config/database';

async function addRegenerateColumn() {
  console.log('🔄 Adding regenerate_on_checkin column to check_in_sessions...');
  try {
    const connection = await pool.getConnection();

    // Check if column already exists
    const [columns] = await connection.execute<any[]>(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'check_in_sessions' 
       AND COLUMN_NAME = 'regenerate_on_checkin'`
    );

    if (columns.length > 0) {
      console.log('✅ Column regenerate_on_checkin already exists');
      connection.release();
      await pool.end();
      return;
    }

    // Add column
    await connection.execute(
      `ALTER TABLE check_in_sessions 
       ADD COLUMN regenerate_on_checkin tinyint(1) NOT NULL DEFAULT 1 
       AFTER is_active`
    );

    connection.release();
    console.log('✅ Column regenerate_on_checkin added successfully!');
  } catch (error: any) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addRegenerateColumn();
}

