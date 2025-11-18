import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

/**
 * Send reminder notification for an event (5 minutes before)
 */
export const sendEventReminder = async (event: any, clubId: number): Promise<void> => {
  try {
    // Format event date and time
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    
    // Parse time (format: "HH:mm" or "HH:mm - HH:mm")
    const timeStr = event.time.trim();
    const startTimeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
    
    if (!startTimeMatch) {
      console.warn(`⚠️  Could not parse event time: ${event.time}`);
      return;
    }
    
    const hours = parseInt(startTimeMatch[1], 10);
    const minutes = parseInt(startTimeMatch[2], 10);
    
    // Create event datetime
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(hours, minutes, 0, 0);
    
    // Format event date in Thai
    const dateStr = eventDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Format event type in Thai
    const eventTypeMap: { [key: string]: string } = {
      practice: 'การซ้อม',
      meeting: 'การประชุม',
      performance: 'การแสดง',
      workshop: 'เวิร์กช็อป',
      other: 'อื่นๆ',
    };
    const eventType = eventTypeMap[event.type] || event.type;
    
    // Create reminder message
    const message = `⏰ แจ้งเตือนความจำ!\n\n` +
      `กิจกรรม "${event.title}" จะเริ่มในอีก 5 นาที\n\n` +
      `📌 ${event.title}\n` +
      `📅 ประเภท: ${eventType}\n` +
      `📆 วันที่: ${dateStr}\n` +
      `⏰ เวลา: ${event.time}\n` +
      `📍 สถานที่: ${event.location}\n` +
      (event.description ? `\n📝 รายละเอียด:\n${event.description}` : '') +
      `\n\nอย่าลืมมาร่วมกิจกรรมนะครับ! 🎉`;
    
    // Get all approved members' emails for this club
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT u.email 
       FROM club_memberships cm
       INNER JOIN users u ON cm.user_id = u.id
       WHERE cm.club_id = ? AND cm.status = 'approved'`,
      [clubId]
    );
    
    const emails = rows.map((row: any) => row.email);
    
    // Send reminder to each member via LINE
    await Promise.all(
      emails.map(async (email) => {
        try {
          // Get LINE User ID for this email
          const [lineRows] = await pool.execute<RowDataPacket[]>(
            'SELECT line_user_id FROM line_users WHERE email = ?',
            [email]
          );
          
          if (lineRows.length === 0) {
            // User not registered with LINE, skip
            return;
          }
          
          const lineUserId = lineRows[0].line_user_id;
          
          // Import sendLineMessage dynamically
          const { sendLineMessage } = await import('./lineBotService');
          await sendLineMessage(lineUserId, message);
          console.log(`📤 Sent reminder to ${email} (LINE ID: ${lineUserId})`);
        } catch (error) {
          console.error(`Error sending reminder to ${email}:`, error);
          // Don't throw - continue with other members
        }
      })
    );
    
    console.log(`✅ Sent reminder for event "${event.title}" to ${emails.length} members`);
  } catch (error) {
    console.error('Error sending event reminder:', error);
    // Don't throw - log error instead
  }
};

/**
 * Check and send reminders for events starting in 5 minutes
 */
export const checkAndSendEventReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
    
    // Get events that start in approximately 5 minutes
    // We'll check events where:
    // 1. Date is today
    // 2. Time is within 5 minutes from now
    // 3. reminder_enabled = 1
    // 4. Not already sent reminder (we'll track this)
    
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get all events for today with reminder enabled
    const [eventRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        e.id,
        e.club_id,
        e.title,
        e.type,
        e.date,
        e.time,
        e.location,
        e.description,
        e.reminder_enabled,
        e.created_at
       FROM events e
       WHERE DATE(e.date) = ?
         AND e.reminder_enabled = 1
       ORDER BY e.time ASC`,
      [today]
    );
    
    if (eventRows.length === 0) {
      return; // No events today
    }
    
    // Process each event
    for (const eventRow of eventRows) {
      try {
        // Parse event time
        const timeStr = eventRow.time.trim();
        const startTimeMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
        
        if (!startTimeMatch) {
          continue; // Skip if can't parse time
        }
        
        const hours = parseInt(startTimeMatch[1], 10);
        const minutes = parseInt(startTimeMatch[2], 10);
        
        // Create event datetime
        const eventDate = new Date(eventRow.date);
        const eventDateTime = new Date(eventDate);
        eventDateTime.setHours(hours, minutes, 0, 0);
        
        // Calculate time difference in minutes
        const timeDiffMinutes = Math.floor((eventDateTime.getTime() - now.getTime()) / (1000 * 60));
        
        // Check if event starts in 4-6 minutes (5 minutes ± 1 minute tolerance)
        if (timeDiffMinutes >= 4 && timeDiffMinutes <= 6) {
          // Check if we already sent reminder for this event today
          // We'll use a simple approach: check if reminder was sent in the last 10 minutes
          // (to avoid duplicate reminders)
          const [reminderCheck] = await pool.execute<RowDataPacket[]>(
            `SELECT id FROM event_reminders 
             WHERE event_id = ? 
             AND DATE(reminder_sent_at) = CURDATE()
             AND reminder_sent_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
             LIMIT 1`,
            [eventRow.id]
          );
          
          if (reminderCheck.length > 0) {
            // Already sent reminder recently, skip
            continue;
          }
          
          // Send reminder
          await sendEventReminder(eventRow, eventRow.club_id);
          
          // Record that we sent the reminder
          try {
            await pool.execute(
              `INSERT INTO event_reminders (event_id, reminder_sent_at)
               VALUES (?, NOW())
               ON DUPLICATE KEY UPDATE reminder_sent_at = NOW()`,
              [eventRow.id]
            );
          } catch (error: any) {
            // If table doesn't exist, log warning but continue
            if (error.code === 'ER_NO_SUCH_TABLE') {
              console.warn('⚠️  event_reminders table does not exist. Reminders will work but won\'t be tracked.');
            } else {
              console.error('Error recording reminder:', error);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing event ${eventRow.id}:`, error);
        // Continue with next event
      }
    }
  } catch (error) {
    console.error('Error checking event reminders:', error);
    // Don't throw - this is a background task
  }
};

