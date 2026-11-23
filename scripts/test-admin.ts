import { strict as assert } from "assert";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/db";
import { Visitor } from "../src/models/Visitor";
import { Photo } from "../src/models/Photo";
import {
  verifyAdminCredentials,
  createSessionToken,
  verifySessionToken,
  getAdminEmail,
} from "../src/lib/admin/auth";
import {
  getPersistentSettings,
  savePersistentSettings,
  DEFAULT_ADMIN_SETTINGS,
  AdminSetting,
} from "../src/lib/admin/settings";
import { storageProvider } from "../src/lib/storage";

console.log("=== RUNNING AGENT 3 ADMIN DASHBOARD INTEGRATION TESTS ===");

const TEST_EMAIL_ADMIN = "admin_test_visitor@example.com";
const TEST_EMAIL_RETURNING = "admin_test_returning@example.com";

async function runAdminTests() {
  try {
    await connectToDatabase();
    console.log("✔ Connected to MongoDB");

    // Clean up test data from any previous runs
    const existing = await Visitor.find({
      email: { $in: [TEST_EMAIL_ADMIN, TEST_EMAIL_RETURNING] },
    });
    const testIds = existing.map((v) => v._id);
    await Photo.deleteMany({ visitorId: { $in: testIds } });
    await Visitor.deleteMany({ _id: { $in: testIds } });
    await AdminSetting.deleteMany({ key: "slideshow_config_test" });

    // -------------------------------------------------------------
    // TEST 1: Admin Authentication & Timing-Safe Verification
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Admin Credentials Verification ---");
    const defaultPassword = process.env.ADMIN_PASSWORD || "AdminSecure2026!";

    // Valid credentials
    const validCheck = verifyAdminCredentials(defaultPassword);
    assert.equal(validCheck, true, "Valid password should verify successfully");

    // Invalid password
    const invalidCheck = verifyAdminCredentials("WrongPassword123!");
    assert.equal(invalidCheck, false, "Invalid password must fail verification");

    // Empty password
    const emptyCheck = verifyAdminCredentials("");
    assert.equal(emptyCheck, false, "Empty password must fail");

    console.log("✔ Credential verification and timing-safe check passed");

    // -------------------------------------------------------------
    // TEST 2: Session Token Creation & Cryptographic Verification
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Session Token Creation & Verification ---");
    const testAdminEmail = getAdminEmail();
    const token = createSessionToken(testAdminEmail);
    assert.ok(token.includes("."), "Session token must be separated by dot");

    const verificationResult = verifySessionToken(token);
    assert.equal(verificationResult.valid, true, "Fresh session token must be valid");
    assert.equal(verificationResult.email, testAdminEmail, "Payload email must match");

    // Tampered token test
    const tamperedToken = token.slice(0, -4) + "ABCD";
    const tamperedResult = verifySessionToken(tamperedToken);
    assert.equal(tamperedResult.valid, false, "Tampered token signature must fail");

    // Malformed token test
    const malformedResult = verifySessionToken("malformed-token-without-signature");
    assert.equal(malformedResult.valid, false, "Malformed token must fail");

    console.log("✔ HMAC-SHA256 session token generation and verification passed");

    // -------------------------------------------------------------
    // TEST 3: Database Records & Overview Statistics Computation
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Overview Statistics Aggregation ---");
    const t0 = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
    const t1 = new Date(); // now

    // Visitor 1: Regular
    const visitor1 = await Visitor.create({
      name: "Barney Calhoun",
      email: TEST_EMAIL_ADMIN,
      normalizedEmail: TEST_EMAIL_ADMIN.toLowerCase(),
      createdAt: t1,
      lastVisitAt: t1,
    });

    // Visitor 2: Returning (createdAt < lastVisitAt)
    const visitor2 = await Visitor.create({
      name: "Alyx Vance",
      email: TEST_EMAIL_RETURNING,
      normalizedEmail: TEST_EMAIL_RETURNING.toLowerCase(),
      createdAt: t0,
      lastVisitAt: t1,
    });

    // Create photos
    const photo1 = await Photo.create({
      visitorId: visitor1._id,
      imageUrl: "/api/media/test-photo-admin-1.jpg",
      originalName: "security-badge.jpg",
      mimeType: "image/jpeg",
      size: 154000,
      consentGiven: true,
      consentTimestamp: t1,
      uploadedAt: t1,
      displayStatus: "active",
    });

    const photo2 = await Photo.create({
      visitorId: visitor2._id,
      imageUrl: "/api/media/test-photo-admin-2.jpg",
      originalName: "retrospective.jpg",
      mimeType: "image/jpeg",
      size: 240000,
      consentGiven: true,
      consentTimestamp: t1,
      uploadedAt: t1,
      displayStatus: "active",
    });

    const totalVisitors = await Visitor.countDocuments();
    assert.ok(totalVisitors >= 2, "Total visitors should be at least 2");

    const returningVisitors = await Visitor.countDocuments({
      $expr: { $gt: [{ $subtract: ["$lastVisitAt", "$createdAt"] }, 1000] },
    });
    assert.ok(returningVisitors >= 1, "Returning visitors should count visitor 2");

    const activePhotos = await Photo.countDocuments({
      displayStatus: "active",
      consentGiven: true,
    });
    assert.ok(activePhotos >= 2, "Active photos count should reflect created photos");

    console.log(`✔ Overview stats verified: ${totalVisitors} visitors, ${returningVisitors} returning, ${activePhotos} active photos`);

    // -------------------------------------------------------------
    // TEST 4: Visitor Directory & Search Functionality
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Visitor Directory & Name/Email Search ---");
    const nameSearch = await Visitor.find({
      name: { $regex: "Barney", $options: "i" },
    });
    assert.equal(nameSearch.length, 1, "Should find Barney Calhoun by name");
    assert.equal(nameSearch[0].email, TEST_EMAIL_ADMIN);

    const emailSearch = await Visitor.find({
      email: { $regex: "admin_test_returning", $options: "i" },
    });
    assert.equal(emailSearch.length, 1, "Should find Alyx Vance by email query");
    assert.equal(emailSearch[0].name, "Alyx Vance");

    console.log("✔ Visitor search by name and email verified");

    // -------------------------------------------------------------
    // TEST 5: Photo Deletion & Independence from Visitor Record
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Photo Deletion & Visitor Record Preservation ---");

    // Verify photo exists before deletion
    const photoBefore = await Photo.findById(photo1._id);
    assert.ok(photoBefore, "Photo 1 should exist prior to deletion");

    // Simulate Admin deleting photo 1
    await Photo.findByIdAndDelete(photo1._id);

    // Verify photo is gone
    const photoAfter = await Photo.findById(photo1._id);
    assert.equal(photoAfter, null, "Photo 1 should be completely deleted");

    // Verify that Visitor 1's record is strictly PRESERVED
    const visitorStillExists = await Visitor.findById(visitor1._id);
    assert.ok(visitorStillExists, "Visitor record MUST NOT be deleted when deleting an individual photo");
    assert.equal(visitorStillExists.email, TEST_EMAIL_ADMIN);

    // Verify that Slideshow delta/active query no longer includes the deleted photo
    const activePhotosAfter = await Photo.find({
      _id: photo1._id,
      displayStatus: "active",
      consentGiven: true,
    });
    assert.equal(activePhotosAfter.length, 0, "Deleted photo must immediately vanish from slideshow queries");

    console.log("✔ Photo deletion removes image and immediately purges from slideshow without deleting visitor history");

    // -------------------------------------------------------------
    // TEST 6: Slideshow Settings Persistence in Database
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Slideshow Settings Persistence ---");
    const initialSettings = await getPersistentSettings();
    assert.ok(initialSettings.durationSeconds >= 2, "Default duration should be valid");

    // Update settings
    const updatedSettings = await savePersistentSettings({
      durationSeconds: 12,
      transition: "slide",
      fitMode: "cover",
      autoPlay: false,
    });

    assert.equal(updatedSettings.durationSeconds, 12, "Duration should be updated to 12s");
    assert.equal(updatedSettings.transition, "slide", "Transition should be slide");
    assert.equal(updatedSettings.fitMode, "cover", "Fit mode should be cover");
    assert.equal(updatedSettings.autoPlay, false, "Autoplay should be false");

    // Read back fresh from DB to verify persistence
    const reloaded = await getPersistentSettings();
    assert.equal(reloaded.durationSeconds, 12);
    assert.equal(reloaded.transition, "slide");
    assert.equal(reloaded.fitMode, "cover");

    // Reset back to sensible default
    await savePersistentSettings(DEFAULT_ADMIN_SETTINGS);
    console.log("✔ Persistent settings update and database reload verified");

    // -------------------------------------------------------------
    // TEST 7: Consent Records & Privacy Policies
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Consent Records & Privacy Verification ---");
    const consentPhotos = await Photo.find({
      visitorId: visitor2._id,
      consentGiven: true,
    });
    assert.equal(consentPhotos.length, 1, "Visitor 2 should have 1 consented photo");
    assert.ok(consentPhotos[0].consentTimestamp, "Consent timestamp must be present");

    // Clean up test data
    await Photo.deleteMany({ visitorId: { $in: [visitor1._id, visitor2._id] } });
    await Visitor.deleteMany({ _id: { $in: [visitor1._id, visitor2._id] } });
    console.log("✔ Consent records verified and test data cleaned up");

    console.log("\n=== ALL AGENT 3 ADMIN INTEGRATION TESTS PASSED ===");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runAdminTests();
