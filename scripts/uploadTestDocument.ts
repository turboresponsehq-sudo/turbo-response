import { getXAICollectionsService } from "../server/services/xaiCollectionsService";
import { readFileSync } from "fs";

async function main() {
  console.log("📤 Uploading test document to xAI Collection...\n");

  const service = getXAICollectionsService();
  const collectionId = "collection_66089751-0963-42d8-a1e2-49e4dc20a4b8";

  try {
    // Read document
    const filePath = "/tmp/2026-05-08_CreditDispute_Philosophy.docx";
    const fileContent = readFileSync(filePath);
    console.log(`✅ Loaded document: ${filePath}`);
    console.log(`   Size: ${fileContent.length} bytes\n`);

    // Define metadata
    const metadata = {
      title: "Consumer Defense Philosophy",
      category: "playbook",
      source_system: "google_drive",
      document_type: "playbook",
      jurisdiction: "federal",
      version: "1.0",
      last_updated: "2026-05-08",
      status: "active",
    };

    console.log("📝 Metadata:");
    Object.entries(metadata).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log();

    // Upload document
    console.log("Uploading to xAI Collection...");
    const result = await service.uploadDocument(
      collectionId,
      "2026-05-08_CreditDispute_Philosophy.docx",
      fileContent,
      metadata
    );

    console.log("✅ Document uploaded successfully!\n");
    console.log("Upload Result:");
    console.log(`  Document ID: ${result.document_id}`);
    console.log(`  Collection ID: ${collectionId}`);
    console.log(`  Status: Active\n`);

    // List documents to verify
    console.log("📋 Verifying upload by listing documents...");
    const documents = await service.listDocuments(collectionId);
    console.log(`✅ Found ${documents.length} document(s) in collection\n`);

    documents.forEach((doc) => {
      console.log(`Document: ${doc.name}`);
      console.log(`  ID: ${doc.document_id}`);
    });

    console.log("\n✅ SUCCESS - Document uploaded and verified!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
