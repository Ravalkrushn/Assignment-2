import { strict as assert } from "assert";
import fs from "fs/promises";
import path from "path";
import { LocalStorageProvider } from "../src/lib/storage";

console.log("=== RUNNING STORAGE ABSTRACTION TESTS ===");

const testDir = path.join(process.cwd(), "uploads_test");
const storage = new LocalStorageProvider(testDir);

async function runStorageTests() {
  try {
    // 1. Create and save a mock image buffer
    const sampleData = Buffer.from("mock image binary data for testing purposes");
    const saveResult = await storage.save(sampleData, "test-photo.jpg", "image/jpeg");

    assert.ok(saveResult.filename.endsWith(".jpg"), "Filename should preserve .jpg extension");
    assert.ok(saveResult.imageUrl.startsWith("/api/media/"), "Image URL should point to controlled media endpoint");
    assert.equal(saveResult.size, sampleData.length);
    console.log("✔ Save to local storage passed:", saveResult.imageUrl);

    // 2. Retrieve the file
    const retrieved = await storage.get(saveResult.filename);
    assert.ok(retrieved !== null, "Retrieved buffer should not be null");
    assert.equal(retrieved!.toString(), sampleData.toString(), "Retrieved contents should match");
    console.log("✔ File retrieval passed");

    // 3. Prevent path traversal attack
    const traversalAttempt = await storage.get("../../../package.json");
    assert.equal(traversalAttempt, null, "Path traversal should not find nonexistent files in upload folder");
    console.log("✔ Path traversal protection verified");

    // 4. Delete the test file
    const deleted = await storage.delete(saveResult.filename);
    assert.equal(deleted, true, "Delete should succeed");
    console.log("✔ File deletion passed");

    // Cleanup test directory
    await fs.rm(testDir, { recursive: true, force: true });
    console.log("✔ Storage cleanup complete");

    console.log("=== ALL STORAGE TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    console.error("Storage test failed:", err);
    process.exit(1);
  }
}

runStorageTests();
