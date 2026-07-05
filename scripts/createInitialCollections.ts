/**
 * Script to create initial xAI Collections for Turbo Response
 * Run with: npx tsx scripts/createInitialCollections.ts
 */

import { getXAICollectionsService } from "../server/services/xaiCollectionsService";

const COLLECTIONS_TO_CREATE = [
  {
    name: "Consumer Defense",
    description: "Consumer protection laws, FCRA, FDCPA, debt collection defense",
  },
  {
    name: "Turbo Response",
    description: "Turbo Response playbooks, intake scripts, and operational procedures",
  },
  {
    name: "SOPs",
    description: "Standard operating procedures and internal documentation",
  },
];

async function main() {
  console.log("🚀 Creating initial xAI Collections...\n");

  const service = getXAICollectionsService();

  try {
    // List existing collections
    console.log("📋 Checking existing collections...");
    const existing = await service.listCollections();
    console.log(`Found ${existing.length} existing collections\n`);

    if (existing.length > 0) {
      console.log("Existing collections:");
      existing.forEach((col) => {
        console.log(`  - ${col.name} (ID: ${col.collection_id})`);
      });
      console.log();
    }

    // Create new collections
    const createdCollections = [];

    for (const collectionSpec of COLLECTIONS_TO_CREATE) {
      try {
        console.log(`Creating collection: "${collectionSpec.name}"...`);
        const collection = await service.createCollection(
          collectionSpec.name,
          collectionSpec.description
        );
        console.log(`✅ Created: ${collection.name}`);
        console.log(`   ID: ${collection.collection_id}`);
        console.log(`   Created: ${collection.created_at}\n`);
        createdCollections.push(collection);
      } catch (error) {
        console.error(`❌ Failed to create "${collectionSpec.name}":`, error);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`Created ${createdCollections.length} new collections\n`);

    if (createdCollections.length > 0) {
      console.log("Collection IDs (for configuration):");
      createdCollections.forEach((col) => {
        console.log(`  ${col.name.toUpperCase().replace(/ /g, "_")}_ID="${col.collection_id}"`);
      });
    }

    console.log("\n✅ Collections created successfully!");
    console.log("\nNext steps:");
    console.log("1. Save the Collection IDs above");
    console.log("2. Update environment variables with Collection IDs");
    console.log("3. Upload documents to Collections");
    console.log("4. Configure Voice Agent to use Collections");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
