"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Tv, Sparkles, RefreshCw, Calendar, Images } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VisitorUploadApiResponse } from "@/types";

interface UploadSuccessViewProps {
  data: VisitorUploadApiResponse;
  onReset: () => void;
}

export const UploadSuccessView: React.FC<UploadSuccessViewProps> = ({ data, onReset }) => {
  const { visitor, photos, previousPhotos, message } = data;

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 bg-[#101317] border border-hairline my-12 animate-fade-in shadow-2xl">
      {/* Top Banner */}
      <div className="border-b border-hairline pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-teal mb-3">
            <CheckCircle2 className="w-4 h-4 text-teal" />
            <span>Submission Confirmed</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-primary-text">
            {visitor.isReturning ? `Welcome Back, ${visitor.name}` : `Welcome, ${visitor.name}`}
          </h2>
          <p className="text-secondary-text text-sm mt-2">{message}</p>
        </div>

        <div className="flex items-center space-x-3 bg-[#0A0C0E] border border-hairline px-5 py-3 self-start md:self-auto">
          <Tv className="w-5 h-5 text-amber animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-muted block">
              STATUS
            </span>
            <span className="text-xs font-semibold text-primary-text uppercase tracking-wider">
              Live in Queue
            </span>
          </div>
        </div>
      </div>

      {/* Visitor Profile Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 p-4 bg-[#0A0C0E]/70 border border-hairline text-xs uppercase tracking-wider">
        <div>
          <span className="text-muted block text-[10px]">VISITOR IDENTITY</span>
          <span className="text-primary-text font-medium">{visitor.name}</span>
        </div>
        <div>
          <span className="text-muted block text-[10px]">RECORD EMAIL</span>
          <span className="text-primary-text font-medium">{visitor.email}</span>
        </div>
        <div>
          <span className="text-muted block text-[10px]">TOTAL ARCHIVED FRAMES</span>
          <span className="text-amber font-mono font-bold">{visitor.totalPhotos} Photos</span>
        </div>
      </div>

      {/* Newly Uploaded Photos Section */}
      <div className="my-8">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber" />
          <h3 className="font-syne text-lg font-bold text-primary-text uppercase tracking-wide">
            Photos Added Today ({photos.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square bg-[#0A0C0E] border border-hairline overflow-hidden group"
            >
              <Image
                src={photo.imageUrl}
                alt={photo.originalName || "Uploaded photo"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-[10px] text-primary-text truncate">
                {photo.originalName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Visits Retrospective (if returning visitor) */}
      {previousPhotos && previousPhotos.length > 0 && (
        <div className="my-8 pt-6 border-t border-hairline">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Images className="w-4 h-4 text-teal" />
              <h3 className="font-syne text-base font-bold text-primary-text uppercase tracking-wide">
                Your Previous Visit Retrospective ({previousPhotos.length})
              </h3>
            </div>
            <span className="text-[11px] text-muted flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Included in Slideshow Rotation</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {previousPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square bg-[#0A0C0E] border border-hairline/80 overflow-hidden opacity-85 hover:opacity-100 transition-opacity"
              >
                <Image
                  src={photo.imageUrl}
                  alt="Previous visit photo"
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-10 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-secondary-text">
          Look toward the main screens to watch your moments play automatically.
        </p>

        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          <span>Upload More Photos</span>
        </Button>
      </div>
    </div>
  );
};
