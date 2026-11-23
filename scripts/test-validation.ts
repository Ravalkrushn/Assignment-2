import { strict as assert } from "assert";
import { validateImageMagicBytes, visitorFormSchema } from "../src/lib/validations/upload";
import { normalizeEmail, formatBytes } from "../src/lib/utils";

console.log("=== RUNNING AGENT 1 UNIT & VALIDATION TESTS ===");

// 1. Email Normalization
{
  const email1 = "  Alex.Vance@GMAIL.COM  ";
  const normalized = normalizeEmail(email1);
  assert.equal(normalized, "alex.vance@gmail.com", "Email normalization failed");
  console.log("✔ Email normalization passed");
}

// 2. Format Bytes
{
  assert.equal(formatBytes(0), "0 Bytes");
  assert.equal(formatBytes(1048576), "1 MB");
  assert.equal(formatBytes(10485760), "10 MB");
  console.log("✔ Format bytes passed");
}

// 3. Visitor Form Schema Validation
{
  // Valid data
  const valid = visitorFormSchema.safeParse({
    name: "Gordon Freeman",
    email: "gordon@blackmesa.gov",
    consentGiven: true,
  });
  assert.equal(valid.success, true, "Valid form data failed validation");

  // Invalid: missing consent
  const missingConsent = visitorFormSchema.safeParse({
    name: "Gordon Freeman",
    email: "gordon@blackmesa.gov",
    consentGiven: false,
  });
  assert.equal(missingConsent.success, false, "Should reject false consent");

  // Invalid: bad email
  const badEmail = visitorFormSchema.safeParse({
    name: "Gordon Freeman",
    email: "not-an-email",
    consentGiven: true,
  });
  assert.equal(badEmail.success, false, "Should reject invalid email");

  // Invalid: empty name
  const emptyName = visitorFormSchema.safeParse({
    name: " ",
    email: "gordon@blackmesa.gov",
    consentGiven: true,
  });
  assert.equal(emptyName.success, false, "Should reject empty name");

  console.log("✔ Form schema validation (consent & fields) passed");
}

// 4. Magic Byte Verification for Images
{
  // Valid JPEG header: FF D8 FF E0 ...
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegCheck = validateImageMagicBytes(jpegBuffer);
  assert.equal(jpegCheck.valid, true);
  assert.equal(jpegCheck.detectedMime, "image/jpeg");

  // Valid PNG header: 89 50 4E 47 0D 0A 1A 0A
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngCheck = validateImageMagicBytes(pngBuffer);
  assert.equal(pngCheck.valid, true);
  assert.equal(pngCheck.detectedMime, "image/png");

  // Valid WEBP header: 'RIFF' ... 'WEBP'
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, // "WEBP"
  ]);
  const webpCheck = validateImageMagicBytes(webpBuffer);
  assert.equal(webpCheck.valid, true);
  assert.equal(webpCheck.detectedMime, "image/webp");

  // Malicious disguised executable / script file
  const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]); // "MZ" PE header
  const exeCheck = validateImageMagicBytes(exeBuffer);
  assert.equal(exeCheck.valid, false, "Should reject non-image executable header");

  // Text / PHP script spoofed as image
  const phpBuffer = Buffer.from("<?php echo 'malicious'; ?>");
  const phpCheck = validateImageMagicBytes(phpBuffer);
  assert.equal(phpCheck.valid, false, "Should reject PHP script header");

  console.log("✔ Magic byte and anti-spoofing validation passed");
}

console.log("=== ALL VALIDATION TESTS PASSED SUCCESSFULLY ===");
