const { query } = require('./src/services/database/db');

async function checkCases() {
  try {
    const result = await query('SELECT id, case_number, full_name, email, category, created_at FROM cases WHERE email = $1 ORDER BY id DESC LIMIT 10', ['collinsdemarcus4@gmail.com']);
    
    console.log(`Found ${result.rows.length} cases for collinsdemarcus4@gmail.com:\n`);
    
    result.rows.forEach(c => {
      console.log(`ID: ${c.id} | Case#: ${c.case_number} | Name: ${c.full_name} | Category: ${c.category} | Created: ${c.created_at}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCases();
