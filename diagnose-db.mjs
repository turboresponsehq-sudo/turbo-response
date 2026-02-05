import mysql from 'mysql2/promise';

async function diagnoseDatabaseAuth() {
  let connection;
  
  try {
    console.log('🔍 Connecting to database...\n');
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // 1. Get table structure
    console.log('📋 USERS TABLE STRUCTURE:');
    console.log('=' .repeat(60));
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(20)} ${col.DATA_TYPE.padEnd(15)} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Check if password column exists
    const hasPasswordColumn = columns.some(col => col.COLUMN_NAME === 'password');
    console.log('\n🔐 PASSWORD COLUMN EXISTS:', hasPasswordColumn ? '✅ YES' : '❌ NO');
    
    // 3. Get sample users (sanitized)
    console.log('\n👥 SAMPLE USERS (sanitized):');
    console.log('=' .repeat(60));
    const [users] = await connection.execute('SELECT * FROM users LIMIT 5');
    
    if (users.length === 0) {
      console.log('  ⚠️  No users found in database');
    } else {
      users.forEach((user, idx) => {
        console.log(`\nUser #${idx + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email || '(null)'}`);
        console.log(`  Name: ${user.name || '(null)'}`);
        console.log(`  Role: ${user.role || '(null)'}`);
        console.log(`  OpenID: ${user.openId || '(null)'}`);
        console.log(`  LoginMethod: ${user.loginMethod || '(null)'}`);
        
        if (hasPasswordColumn) {
          console.log(`  Has Password: ${user.password ? '✅ YES (hash: ' + user.password.substring(0, 10) + '...)' : '❌ NO'}`);
        }
        
        console.log(`  Created: ${user.createdAt}`);
        console.log(`  Last Sign In: ${user.lastSignedIn}`);
      });
    }
    
    // 4. Check for other auth-related tables
    console.log('\n\n📊 ALL TABLES IN DATABASE:');
    console.log('=' .repeat(60));
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // 5. Summary
    console.log('\n\n📝 SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`Total users: ${users.length}`);
    console.log(`Password column exists: ${hasPasswordColumn ? 'YES' : 'NO'}`);
    
    if (hasPasswordColumn) {
      const usersWithPasswords = users.filter(u => u.password).length;
      console.log(`Users with passwords set: ${usersWithPasswords}/${users.length}`);
    }
    
    console.log('\n✅ Diagnostic complete\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

diagnoseDatabaseAuth();
