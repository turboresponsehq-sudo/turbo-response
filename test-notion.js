const { Client } = require('@notionhq/client');

console.log('NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY);

const notion = new Client({ auth: process.env.NOTION_API_KEY });

console.log('Client created successfully');
console.log('Testing database query...');

notion.databases.retrieve({ database_id: '27b5fd7e0bd580e09b1aff26ae100b82' })
  .then(response => {
    console.log('✅ Notion API connection successful!');
    console.log('📊 Database title:', response.title[0]?.plain_text || 'Untitled');
    console.log('📋 Database ID:', response.id);
  })
  .catch(error => {
    console.error('❌ Notion API error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    process.exit(1);
  });
