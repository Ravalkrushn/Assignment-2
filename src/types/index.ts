export interface IVisitor {
  _id: string;
  name: string;
  email: string;
  normalizedEmail: string;
  createdAt: string | Date;
  lastVisitAt: string | Date;
}

export type PhotoDisplayStatus = "active" | "archived" | "flagged";

export interface IPhoto {
  _id: string;
  visitorId: string | IVisitor;
  imageUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  consentGiven: boolean;
  consentTimestamp: string | Date;
  uploadedAt: string | Date;
  displayStatus: PhotoDisplayStatus;
}

export interface VisitorUploadApiResponse {
  success: boolean;
  message: string;
  visitor: {
    id: string;
    name: string;
    email: string;
    isReturning: boolean;
    lastVisitAt: string;
    totalPhotos: number;
  };
  photos: Array<{
    id: string;
    imageUrl: string;
    originalName: string;
    uploadedAt: string;
  }>;
  previousPhotos?: Array<{
    id: string;
    imageUrl: string;
    uploadedAt: string;
  }>;
}

export interface VisitorLookupResponse {
  exists: boolean;
  visitor?: {
    id: string;
    name: string;
    email: string;
    lastVisitAt: string;
    photoCount: number;
    recentPhotos: Array<{
      id: string;
      imageUrl: string;
      uploadedAt: string;
    }>;
  };
}
