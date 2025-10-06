/**
 * Review workflow context for tracking node review status
 * Because Master Jedi wants a proper walkthrough experience
 */
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';

import { fetchPolicyActors, type PolicyActor } from '@/adapters/policy-actors-client';

export interface NodeReviewStatus {
  nodeId: string;
  reviewed: boolean;
  approved: boolean;
  notes?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface UploadedPolicyDocument {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  previewUrl: string;
}

interface ReviewContextType {
  // Review status tracking
  reviewStatus: Record<string, NodeReviewStatus>;
  setNodeReviewed: (nodeId: string, approved: boolean, notes?: string) => void;
  isNodeReviewed: (nodeId: string) => boolean;
  isNodeApproved: (nodeId: string) => boolean;
  getReviewedCount: () => number;
  getTotalNodes: () => number;
  resetReviews: () => void;
  approveAllNodes: () => void;

  // Walkthrough mode
  isWalkthroughMode: boolean;
  startWalkthrough: () => void;
  endWalkthrough: () => void;
  isWalkthroughPaused: boolean;
  pauseWalkthrough: () => void;
  resumeWalkthrough: () => void;
  toggleWalkthroughPause: () => void;
  currentNodeId: string | null;
  setCurrentNode: (nodeId: string | null) => void;

  // Navigation
  nextNode: () => void;
  previousNode: () => void;
  nodeSequence: string[];
  setNodeSequence: (sequence: string[]) => void;

  // Document upload
  policyDocument: UploadedPolicyDocument | null;
  uploadPolicyDocument: (file: File) => UploadedPolicyDocument | null;
  removePolicyDocument: () => void;

  // Publishing
  canPublish: () => boolean;
  getPublishStats: () => {
    total: number;
    reviewed: number;
    approved: number;
    rejected: number;
  };

  policyActors: ReadonlyArray<PolicyActor>;
  isPolicyActorsLoading: boolean;
  policyActorsError: string | null;
  refreshPolicyActors: () => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviewStatus, setReviewStatus] = useState<Record<string, NodeReviewStatus>>({});
  const [isWalkthroughMode, setIsWalkthroughMode] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [nodeSequence, setNodeSequence] = useState<string[]>([]);
  const [isWalkthroughPaused, setIsWalkthroughPaused] = useState(false);
  const [policyDocument, setPolicyDocument] = useState<UploadedPolicyDocument | null>(null);
  const [policyActors, setPolicyActors] = useState<PolicyActor[]>([]);
  const [isPolicyActorsLoading, setIsPolicyActorsLoading] = useState(false);
  const [policyActorsError, setPolicyActorsError] = useState<string | null>(null);
  const policyActorsControllerRef = useRef<AbortController | null>(null);

  const setNodeReviewed = useCallback((nodeId: string, approved: boolean, notes?: string) => {
    setReviewStatus(prev => ({
      ...prev,
      [nodeId]: {
        nodeId,
        reviewed: true,
        approved,
        notes,
        reviewedAt: new Date(),
        reviewedBy: 'Master Jedi Barney' // Would come from auth in real app
      }
    }));
  }, []);
  
  const isNodeReviewed = useCallback((nodeId: string) => {
    return reviewStatus[nodeId]?.reviewed || false;
  }, [reviewStatus]);
  
  const isNodeApproved = useCallback((nodeId: string) => {
    return reviewStatus[nodeId]?.approved || false;
  }, [reviewStatus]);
  
  const getReviewedCount = useCallback(() => {
    return Object.values(reviewStatus).filter(s => s.reviewed).length;
  }, [reviewStatus]);
  
  const getTotalNodes = useCallback(() => {
    return nodeSequence.length;
  }, [nodeSequence]);
  
  const resetReviews = useCallback(() => {
    setReviewStatus({});
    setCurrentNodeId(null);
    setIsWalkthroughMode(false);
    setIsWalkthroughPaused(false);
  }, []);
  
  const approveAllNodes = useCallback(() => {
    const allApproved: Record<string, NodeReviewStatus> = {};
    nodeSequence.forEach(nodeId => {
      allApproved[nodeId] = {
        nodeId,
        reviewed: true,
        approved: true,
        notes: 'Bulk approved',
        reviewedAt: new Date(),
        reviewedBy: 'Master Jedi Barney'
      };
    });
    setReviewStatus(allApproved);
  }, [nodeSequence]);
  
  const startWalkthrough = useCallback(() => {
    setIsWalkthroughPaused(false);
    setIsWalkthroughMode(true);
    if (nodeSequence.length > 0) {
      setCurrentNodeId(nodeSequence[0]);
    }
  }, [nodeSequence]);

  const endWalkthrough = useCallback(() => {
    setIsWalkthroughMode(false);
    setCurrentNodeId(null);
    setIsWalkthroughPaused(false);
  }, []);
  
  const setCurrentNode = useCallback((nodeId: string | null) => {
    setCurrentNodeId(nodeId);
  }, []);

  const pauseWalkthrough = useCallback(() => {
    setIsWalkthroughPaused(true);
  }, []);

  const resumeWalkthrough = useCallback(() => {
    setIsWalkthroughPaused(false);
  }, []);

  const toggleWalkthroughPause = useCallback(() => {
    setIsWalkthroughPaused((prev) => !prev);
  }, []);

  const uploadPolicyDocument = useCallback((file: File): UploadedPolicyDocument | null => {
    if (!file) return null;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return null;
    }

    const nextDocument: UploadedPolicyDocument = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/pdf',
      uploadedAt: new Date(),
      previewUrl: URL.createObjectURL(file),
    };

    setPolicyDocument((previous) => {
      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return nextDocument;
    });

    return nextDocument;
  }, []);

  const removePolicyDocument = useCallback(() => {
    setIsWalkthroughPaused(false);
    setPolicyDocument((previous) => {
      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (policyDocument?.previewUrl) {
        URL.revokeObjectURL(policyDocument.previewUrl);
      }
    };
  }, [policyDocument]);

  const nextNode = useCallback(() => {
    if (!currentNodeId || nodeSequence.length === 0) return;
    
    const currentIndex = nodeSequence.indexOf(currentNodeId);
    if (currentIndex < nodeSequence.length - 1) {
      setCurrentNodeId(nodeSequence[currentIndex + 1]);
    }
  }, [currentNodeId, nodeSequence]);
  
  const previousNode = useCallback(() => {
    if (!currentNodeId || nodeSequence.length === 0) return;
    
    const currentIndex = nodeSequence.indexOf(currentNodeId);
    if (currentIndex > 0) {
      setCurrentNodeId(nodeSequence[currentIndex - 1]);
    }
  }, [currentNodeId, nodeSequence]);
  
  const canPublish = useCallback(() => {
    // All nodes must be reviewed and approved
    if (nodeSequence.length === 0) return false;
    
    return nodeSequence.every(nodeId => {
      const status = reviewStatus[nodeId];
      return status?.reviewed && status?.approved;
    });
  }, [reviewStatus, nodeSequence]);
  
  const getPublishStats = useCallback(() => {
    const reviewed = Object.values(reviewStatus).filter(s => s.reviewed);
    return {
      total: nodeSequence.length,
      reviewed: reviewed.length,
      approved: reviewed.filter(s => s.approved).length,
      rejected: reviewed.filter(s => !s.approved).length
    };
  }, [reviewStatus, nodeSequence]);
  
  const value: ReviewContextType = {
    reviewStatus,
    setNodeReviewed,
    isNodeReviewed,
    isNodeApproved,
    getReviewedCount,
    getTotalNodes,
    resetReviews,
    approveAllNodes,
    isWalkthroughMode,
    startWalkthrough,
    endWalkthrough,
    isWalkthroughPaused,
    pauseWalkthrough,
    resumeWalkthrough,
    toggleWalkthroughPause,
    currentNodeId,
    setCurrentNode,
    nextNode,
    previousNode,
    nodeSequence,
    setNodeSequence,
    policyDocument,
    uploadPolicyDocument,
    removePolicyDocument,
    canPublish,
    getPublishStats
  };
  
  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
}
