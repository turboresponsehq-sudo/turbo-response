import { getXAICollectionsService } from "../server/services/xaiCollectionsService";

async function main() {
  console.log("🚀 Creating Consumer Defense Collection...\n");

  const service = getXAICollectionsService();

  try {
    console.log("Creating collection: 'Consumer Defense'...");
    const collection = await service.createCollection(
      "Consumer Defense",
      "Consumer protection laws, FCRA, FDCPA, debt collection defense"
    );
    
    console.log("✅ Collection created successfully!\n");
    console.log("Collection Details:");
    console.log(`  Name: ${collection.name}`);
    console.log(`  ID: ${collection.collection_id}`);
    console.log(`  Created: ${collection.created_at}`);
    console.log(`  Description: ${collection.description}`);
    
    console.log("\n✅ SUCCESS - Collection is ready to use!");
    console.log(`\nSave this ID for later: ${collection.collection_id}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
