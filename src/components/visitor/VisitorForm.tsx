"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileImage,
  Clock,
  History,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UploadSuccessView } from "./UploadSuccessView";
import { formatBytes } from "@/lib/utils";
import { VisitorUploadApiResponse, VisitorLookupResponse } from "@/types";

interface SelectedFile {
  file: File;
  previewUrl: string;
  id: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const VisitorForm: React.FC = () => {
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  // Files
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [returningVisitorData, setReturningVisitorData] = useState<VisitorLookupResponse["visitor"] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<VisitorUploadApiResponse | null>(null);

  // Returning visitor lookup on email change / blur
  const checkReturningEmail = useCallback(async (emailToCheck: string) => {
    const trimmed = emailToCheck.trim();
    if (!trimmed || !trimmed.includes("@") || trimmed.length < 5) {
      setReturningVisitorData(null);
      return;
    }

    try {
      setIsCheckingEmail(true);
      const res = await fetch(`/api/visitor/lookup?email=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data: VisitorLookupResponse = await res.json();
        if (data.exists && data.visitor) {
          setReturningVisitorData(data.visitor);
          // Auto populate name if not already entered
          setName((currentName) => currentName.trim() ? currentName : data.visitor!.name);
        } else {
          setReturningVisitorData(null);
        }
      }
    } catch (e) {
      console.warn("Returning visitor lookup failed:", e);
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  const handleEmailBlur = () => {
    checkReturningEmail(email);
  };

  // File selection handling
  const handleFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: SelectedFile[] = [];

    const currentCount = selectedFiles.length;
    const remainingSlots = MAX_FILES - currentCount;

    if (incomingFiles.length > remainingSlots) {
      setErrorMessage(`You can only upload up to ${MAX_FILES} photos. You have ${remainingSlots} slots remaining.`);
    }

    const filesToProcess = Array.from(incomingFiles).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      // Validate MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not supported. Please select JPG, PNG, or WEBP images.`);
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`"${file.name}" is larger than ${formatBytes(MAX_FILE_SIZE)}.`);
        continue;
      }

      // Check duplicates
      const isDuplicate = selectedFiles.some(
        (sf) => sf.file.name === file.name && sf.file.size === file.size
      );
      if (isDuplicate) {
        continue;
      }

      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (idToRemove: string) => {
    setSelectedFiles((prev) => {
      const fileToRevoke = prev.find((f) => f.id === idToRemove);
      if (fileToRevoke) {
        URL.revokeObjectURL(fileToRevoke.previewUrl);
      }
      return prev.filter((f) => f.id !== idToRemove);
    });
  };

  // Drag and drop events
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one photo to upload.");
      return;
    }

    if (!consentGiven) {
      setErrorMessage("You must agree to display your photos on the venue slideshow.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(15);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("consentGiven", "true");

      selectedFiles.forEach((item) => {
        formData.append("photos", item.file);
      });

      setUploadProgress(50);

      const res = await fetch("/api/visitor/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to upload photos. Please try again.");
      }

      setUploadProgress(100);
      setSuccessResponse(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Revoke object URLs to prevent memory leak
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setSelectedFiles([]);
    setName("");
    setEmail("");
    setConsentGiven(false);
    setReturningVisitorData(null);
    setErrorMessage(null);
    setSuccessResponse(null);
    setUploadProgress(0);
  };

  if (successResponse) {
    return <UploadSuccessView data={successResponse} onReset={handleReset} />;
  }

  return (
    <div id="visitor-form-section" className="w-full max-w-4xl mx-auto py-16 px-6">
      {/* Form Section Header */}
      <div className="mb-10 text-center">
        <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
          [ STEP 1 TO 4 ]
        </span>
        <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-text mt-2">
          Submit Your Photos
        </h2>
        <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto mt-3">
          Upload up to {MAX_FILES} high-resolution photos. Your images will broadcast immediately to the main venue slideshow.
        </p>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#101317] border border-hairline p-6 sm:p-10 shadow-2xl relative"
      >
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Visitor Identity */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-hairline">
            <span className="font-syne font-bold text-xs text-amber uppercase tracking-wider">01 // Identity</span>
            <span className="text-xs text-muted">Who is visiting today?</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="e.g. Alex Vance"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="alex@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                disabled={isSubmitting}
                hint={isCheckingEmail ? "Checking archive..." : "Used to connect returning visits and build your gallery."}
              />
            </div>
          </div>

          {/* Returning visitor welcome banner */}
          {returningVisitorData && (
            <div className="mt-4 p-4 bg-[#0A0C0E] border border-teal/40 flex items-start space-x-3 text-xs">
              <History className="w-4 h-4 text-teal shrink-0 mt-0.5" />
              <div>
                <span className="text-teal font-semibold uppercase tracking-wider block">
                  Returning Visitor Recognized
                </span>
                <p className="text-secondary-text mt-0.5">
                  Welcome back, <strong className="text-primary-text">{returningVisitorData.name}</strong>! You have{" "}
                  <strong className="text-amber">{returningVisitorData.photoCount}</strong> photos from your previous visits.
                  Your new photos will be added to your existing collection and played together in the slideshow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Photo Upload Dropzone */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-hairline">
            <div className="flex items-center space-x-3">
              <span className="font-syne font-bold text-xs text-amber uppercase tracking-wider">02 // Photos</span>
              <span className="text-xs text-muted">Upload your moments</span>
            </div>
            <span className="text-xs font-mono text-secondary-text">
              {selectedFiles.length}/{MAX_FILES} Selected
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
            disabled={isSubmitting || selectedFiles.length >= MAX_FILES}
          />

          {/* Drag & Drop Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => {
              if (selectedFiles.length < MAX_FILES && !isSubmitting) {
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-amber bg-amber/5"
                : "border-hairline bg-[#0A0C0E]/60 hover:border-amber/40 hover:bg-[#0A0C0E]"
            } ${selectedFiles.length >= MAX_FILES ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#101317] border border-hairline flex items-center justify-center text-amber">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-text">
                  <span className="text-amber font-semibold">Click to browse</span> or drag and drop photos
                </p>
                <p className="text-xs text-muted mt-1">
                  Supports JPG, PNG, WEBP — up to {formatBytes(MAX_FILE_SIZE)} per photo
                </p>
              </div>
            </div>
          </div>

          {/* Selected Photos Grid Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <span className="text-[11px] uppercase tracking-wider text-muted block mb-3 font-mono">
                Queued For Broadcast ({selectedFiles.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {selectedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square bg-[#0A0C0E] border border-hairline group overflow-hidden"
                  >
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom file info */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1.5 text-[9px] text-primary-text truncate">
                      {formatBytes(item.file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Privacy & Explicit Consent */}
        <div className="mb-10 pt-4 border-t border-hairline">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span className="font-syne font-bold text-xs text-teal uppercase tracking-wider">
              03 // Privacy & Public Display Consent
            </span>
          </div>

          <div className="p-4 bg-[#0A0C0E] border border-hairline">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                disabled={isSubmitting}
                className="mt-1 h-4 w-4 rounded-none border-hairline bg-[#101317] text-amber focus:ring-amber focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-secondary-text leading-relaxed">
                <strong className="text-primary-text block mb-1">
                  Public Broadcast Consent Confirmation
                </strong>
                I acknowledge and explicitly agree that my uploaded photos and name may be displayed publicly on the venue&apos;s smart screens and real-time computer slideshows. I confirm that I own or have the right to share these photographs, and that consent will be recorded with an immutable timestamp upon submission.
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: Submission and Progress */}
        <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Automatic Instant Playback on Smart Display</span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting || selectedFiles.length === 0 || !consentGiven}
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#0A0C0E]" />
            <span>{isSubmitting ? "Broadcasting Photos..." : "Upload & Play on Screen"}</span>
          </Button>
        </div>

        {/* Live Upload Progress Bar */}
        {isSubmitting && (
          <div className="mt-6 w-full bg-[#0A0C0E] h-1.5 overflow-hidden border border-hairline">
            <div
              className="bg-amber h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </form>
    </div>
  );
};
