import pool from '../config/database';

async function addClubIdToEvents() {
  console.log('🔄 Adding club_id column to events table...');
  try {
    const connection = await pool.getConnection();

    // Check if column already exists
    const [columns] = await connection.execute<any[]>(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'events' 
       AND COLUMN_NAME = 'club_id'`
    );

    if (columns.length > 0) {
      console.log('✅ Column club_id already exists');
      connection.release();
      await pool.end();
      return;
    }

    // Add club_id column
    await connection.execute(
      `ALTER TABLE events 
       ADD COLUMN club_id int(11) NOT NULL 
       AFTER id`
    );

    // Update existing events: set club_id based on created_by user's primary club
    // Get user's primary club from club_memberships (leader role or first approved membership)
    await connection.execute(`
      UPDATE events e
      INNER JOIN (
        SELECT 
          cm.user_id,
          COALESCE(
            MAX(CASE WHEN cm.role = 'leader' THEN cm.club_id END),
            MAX(cm.club_id)
          ) as primary_club_id
        FROM club_memberships cm
        WHERE cm.status = 'approved'
        GROUP BY cm.user_id
      ) user_clubs ON e.created_by = user_clubs.user_id
      SET e.club_id = user_clubs.primary_club_id
      WHERE e.club_id = 0 OR e.club_id IS NULL
    `);

    // For events without club (shouldn't happen, but set default to 1)
    await connection.execute(
      `UPDATE events SET club_id = 1 WHERE club_id = 0 OR club_id IS NULL`
    );

    // Add foreign key constraint
    await connection.execute(
      `ALTER TABLE events 
       ADD CONSTRAINT events_ibfk_2 
       FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE`
    );

    // Add index
    await connection.execute(
      `ALTER TABLE events 
       ADD KEY idx_club_id (club_id)`
    );

    connection.release();
    console.log('✅ Column club_id added successfully!');
    console.log('✅ Existing events updated with club_id');
  } catch (error: any) {
    console.error('❌ Error adding club_id column:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addClubIdToEvents();
}

