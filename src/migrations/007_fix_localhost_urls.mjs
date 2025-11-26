import mysql from 'mysql2/promise';

export const up = async () => {
  console.log('🔧 Fixing localhost URLs in documents...');
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // MySQL syntax - no ::text or ::json casts needed
    const [result] = await connection.execute(`
      UPDATE cases 
      SET documents = REPLACE(documents, 'localhost:5000', 'turboresponsehq.ai')
      WHERE documents LIKE '%localhost:5000%'
    `);
    
    console.log(`✅ Updated ${result.affectedRows} case(s) with localhost URLs`);
    await connection.end();
  } catch (error) {
    console.error('❌ Migration 007 failed:', error.message);
    // Don't throw - allow other migrations to continue
  }
};

export const down = async () => {
  console.log('⏪ Reverting localhost URL fixes...');
  
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    await connection.execute(`
      UPDATE cases 
      SET documents = REPLACE(documents, 'turboresponsehq.ai', 'localhost:5000')
      WHERE documents LIKE '%turboresponsehq.ai%'
    `);
    
    console.log('✅ Reverted URL fixes');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration 007 rollback failed:', error.message);
  }
};
