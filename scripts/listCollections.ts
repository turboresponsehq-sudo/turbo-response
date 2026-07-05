import { getXAICollectionsService } from "../server/services/xaiCollectionsService";

async function main() {
  console.log("📋 Listing all Collections...\n");

  const service = getXAICollectionsService();

  try {
    const collections = await service.listCollections();
    
    console.log(`✅ Found ${collections.length} collection(s)\n`);
    
    collections.forEach((col) => {
      console.log(`Collection: ${col.name}`);
      console.log(`  ID: ${col.collection_id}`);
      console.log(`  Created: ${col.created_at}`);
      if (col.description) {
        console.log(`  Description: ${col.description}`);
      }
      console.log();
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
