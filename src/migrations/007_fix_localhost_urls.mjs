import { query } from '../db.js';

export const up = async () => {
  console.log('🔧 Fixing localhost URLs in documents...');
  
  const result = await query(`
    UPDATE cases 
    SET documents = REPLACE(documents::text, 'localhost:5000', 'turbo-response-backend.onrender.com')::json
    WHERE documents::text LIKE '%localhost:5000%'
  `);
  
  console.log(`✅ Updated ${result.rowCount} case(s) with localhost URLs`);
};

export const down = async () => {
  console.log('⏪ Reverting localhost URL fixes...');
  
  await query(`
    UPDATE cases 
    SET documents = REPLACE(documents::text, 'turbo-response-backend.onrender.com', 'localhost:5000')::json
    WHERE documents::text LIKE '%turbo-response-backend.onrender.com%'
  `);
  
  console.log('✅ Reverted URL fixes');
};
