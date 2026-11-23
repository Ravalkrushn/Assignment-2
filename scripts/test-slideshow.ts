import { strict as assert } from "assert";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/db";
import { Visitor } from "../src/models/Visitor";
import { Photo } from "../src/models/Photo";

console.log("=== RUNNING AGENT 2 SLIDESHOW INTEGRATION TESTS ===");

const TEST_EMAIL_1 = "slideshow_test_eli@example.com";
const TEST_EMAIL_2 = "slideshow_test_alyx@example.com";

async function runSlideshowTests() {
  try {
    await connectToDatabase();
    console.log("✔ Connected to database");

    // Clean up any previous test records
    const existingVisitors = await Visitor.find({
      email: { $in: [TEST_EMAIL_1, TEST_EMAIL_2] },
    });
    const visitorIds = existingVisitors.map((v) => v._id);
    await Photo.deleteMany({ visitorId: { $in: visitorIds } });
    await Visitor.deleteMany({ _id: { $in: visitorIds } });

    // TEST 1: Empty Slideshow State Handling
    console.log("\n--- TEST 1: Empty Gallery Handling ---");
    const emptyCount = await Photo.countDocuments({
      visitorId: { $in: visitorIds },
      displayStatus: "active",
      consentGiven: true,
    });
    assert.equal(emptyCount, 0, "Initial test photo count should be 0");
    console.log("✔ Empty state query verified (0 photos)");

    // TEST 2: Single Photo Upload & Retrieval
    console.log("\n--- TEST 2: Single Photo Addition & Visibility ---");
    const t0 = new Date();
    const visitor1 = await Visitor.create({
      name: "Eli Vance",
      email: TEST_EMAIL_1,
      normalizedEmail: TEST_EMAIL_1.toLowerCase(),
      createdAt: t0,
      lastVisitAt: t0,
    });

    const photo1 = await Photo.create({
      visitorId: visitor1._id,
      imageUrl: "/api/media/test-photo-1.jpg",
      originalName: "lab-arrival.jpg",
      mimeType: "image/jpeg",
      size: 204800,
      consentGiven: true,
      consentTimestamp: t0,
      uploadedAt: t0,
      displayStatus: "active",
    });

    // Query slideshow active list
    const activePhotosTest2 = await Photo.find({
      _id: photo1._id,
      displayStatus: "active",
      consentGiven: true,
    }).populate("visitorId", "name email createdAt lastVisitAt");

    assert.equal(activePhotosTest2.length, 1);
    assert.equal((activePhotosTest2[0].visitorId as any).name, "Eli Vance");
    console.log("✔ Single photo successfully retrieved with populated visitor identity");

    // TEST 3: Multiple Photos & Multiple Visitors
    console.log("\n--- TEST 3: Multiple Photos & Multiple Visitors ---");
    const visitor2 = await Visitor.create({
      name: "Alyx Vance",
      email: TEST_EMAIL_2,
      normalizedEmail: TEST_EMAIL_2.toLowerCase(),
      createdAt: new Date(),
      lastVisitAt: new Date(),
    });

    const photo2 = await Photo.create({
      visitorId: visitor2._id,
      imageUrl: "/api/media/test-photo-2.jpg",
      originalName: "citadel-view.png",
      mimeType: "image/png",
      size: 512000,
      consentGiven: true,
      consentTimestamp: new Date(),
      uploadedAt: new Date(Date.now() + 1000),
      displayStatus: "active",
    });

    const photo3 = await Photo.create({
      visitorId: visitor1._id,
      imageUrl: "/api/media/test-photo-3.jpg",
      originalName: "gravity-gun.webp",
      mimeType: "image/webp",
      size: 154000,
      consentGiven: true,
      consentTimestamp: new Date(),
      uploadedAt: new Date(Date.now() + 2000),
      displayStatus: "active",
    });

    const allTestPhotos = await Photo.find({
      _id: { $in: [photo1._id, photo2._id, photo3._id] },
      displayStatus: "active",
      consentGiven: true,
    })
      .sort({ uploadedAt: -1 })
      .populate("visitorId", "name");

    assert.equal(allTestPhotos.length, 3, "All 3 active photos should be present");
    assert.equal(allTestPhotos[0]._id.toString(), photo3._id.toString(), "Newest photo should be first");
    console.log("✔ Multiple photos from multiple visitors retrieved in chronological order");

    // TEST 4: Returning Visitor Identification
    console.log("\n--- TEST 4: Returning Visitor Identification ---");
    // Simulate Eli returning at a later time
    const laterVisitTime = new Date(t0.getTime() + 60000); // 1 minute later
    visitor1.lastVisitAt = laterVisitTime;
    await visitor1.save();

    // Verify returning condition: lastVisitAt - createdAt > 1000ms
    const isReturningEli =
      visitor1.lastVisitAt.getTime() - visitor1.createdAt.getTime() > 1000;
    const isReturningAlyx =
      visitor2.lastVisitAt.getTime() - visitor2.createdAt.getTime() > 1000;

    assert.equal(isReturningEli, true, "Eli should be identified as returning visitor");
    assert.equal(isReturningAlyx, false, "Alyx should NOT be returning visitor yet");
    console.log("✔ Returning visitor identity accurately detected");

    // TEST 5: Delta Polling Logic
    console.log("\n--- TEST 5: Real-time Delta Polling Logic ---");
    const pollSinceTimestamp = photo2.uploadedAt; // After photo1 & photo2, before photo3

    const newSincePoll = await Photo.countDocuments({
      _id: { $in: [photo1._id, photo2._id, photo3._id] },
      displayStatus: "active",
      consentGiven: true,
      uploadedAt: { $gt: pollSinceTimestamp },
    });

    assert.equal(newSincePoll, 1, "Delta polling should detect exactly 1 photo added after timestamp");

    const noNewSincePoll = await Photo.countDocuments({
      _id: { $in: [photo1._id, photo2._id, photo3._id] },
      displayStatus: "active",
      consentGiven: true,
      uploadedAt: { $gt: photo3.uploadedAt },
    });

    assert.equal(noNewSincePoll, 0, "Delta polling should return 0 when no new uploads exist");
    console.log("✔ Delta polling detection verified");

    // TEST 6: Consent Enforcement & Non-Active Status Filter
    console.log("\n--- TEST 6: Exclusion of Non-Consented and Flagged Photos ---");
    // Flagged photo
    const flaggedPhoto = await Photo.create({
      visitorId: visitor1._id,
      imageUrl: "/api/media/flagged.jpg",
      originalName: "flagged.jpg",
      mimeType: "image/jpeg",
      size: 1000,
      consentGiven: true,
      uploadedAt: new Date(),
      displayStatus: "flagged",
    });

    // Non-consented photo
    const unconsentedPhoto = await Photo.create({
      visitorId: visitor1._id,
      imageUrl: "/api/media/unconsented.jpg",
      originalName: "unconsented.jpg",
      mimeType: "image/jpeg",
      size: 1000,
      consentGiven: false,
      uploadedAt: new Date(),
      displayStatus: "active",
    });

    // Archived photo
    const archivedPhoto = await Photo.create({
      visitorId: visitor1._id,
      imageUrl: "/api/media/archived.jpg",
      originalName: "archived.jpg",
      mimeType: "image/jpeg",
      size: 1000,
      consentGiven: true,
      uploadedAt: new Date(),
      displayStatus: "archived",
    });

    const shouldNotInclude = await Photo.find({
      _id: { $in: [flaggedPhoto._id, unconsentedPhoto._id, archivedPhoto._id] },
      displayStatus: "active",
      consentGiven: true,
    });

    assert.equal(shouldNotInclude.length, 0, "Flagged, archived, or unconsented photos must never display in slideshow");
    console.log("✔ Non-consented and flagged photos successfully filtered out");

    // Cleanup test records
    await Photo.deleteMany({
      _id: {
        $in: [
          photo1._id,
          photo2._id,
          photo3._id,
          flaggedPhoto._id,
          unconsentedPhoto._id,
          archivedPhoto._id,
        ],
      },
    });
    await Visitor.deleteMany({ _id: { $in: [visitor1._id, visitor2._id] } });
    console.log("✔ Test data cleanup complete");

    console.log("\n=== ALL SLIDESHOW TESTS PASSED SUCCESSFULLY ===");
    process.exit(0);
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  }
}

runSlideshowTests();
