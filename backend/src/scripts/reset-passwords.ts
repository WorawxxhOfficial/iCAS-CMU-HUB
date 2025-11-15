import bcrypt from 'bcryptjs';
import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Reset passwords for all test users to a known password
 * Default password: password123
 */
async function resetPasswords() {
  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  try {
    const connection = await pool.getConnection();
    
    // Update all users' passwords
    const [result] = await connection.execute(
      'UPDATE users SET password = ?',
      [hashedPassword]
    ) as any;

    console.log(`✅ Successfully reset passwords for ${result.affectedRows} users`);
    console.log(`📝 Default password for all users: ${defaultPassword}`);
    console.log('\nTest accounts:');
    console.log('- admin@cmu.ac.th');
    console.log('- leader@cmu.ac.th');
    console.log('- leader2@cmu.ac.th');
    console.log('- leader3@cmu.ac.th');
    console.log('- member@cmu.ac.th');
    console.log('- member2@cmu.ac.th');
    console.log('- member3@cmu.ac.th');
    console.log('- member4@cmu.ac.th');
    console.log('- member5@cmu.ac.th');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    process.exit(1);
  }
}

resetPasswords();

