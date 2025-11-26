import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AutosaveOptions<T> {
  data: T;
  storageKey: string;
  interval?: number; // in milliseconds, default 30000 (30 seconds)
  onSave?: (data: T) => void;
  onRestore?: (data: T) => void;
  shouldAutosave?: (data: T) => boolean;
}

/**
 * Hook for autosaving form data to localStorage
 * - Saves periodically (default every 30 seconds)
 * - Saves before page unload
 * - Provides restore functionality
 */
export function useAutosave<T>({
  data,
  storageKey,
  interval = 30000,
  onSave,
  shouldAutosave = () => true
}: AutosaveOptions<T>) {
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  // Save to localStorage
  const saveDraft = useCallback(() => {
    if (!shouldAutosave(data)) {
      return;
    }

    const dataString = JSON.stringify(data);

    // Only save if data has changed
    if (dataString !== lastSaveRef.current) {
      try {
        localStorage.setItem(storageKey, dataString);
        localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString());
        lastSaveRef.current = dataString;
        onSave?.(data);
        console.log(`[Autosave] Draft saved to ${storageKey}`);
      } catch (error) {
        console.error('[Autosave] Error saving draft:', error);
      }
    }
  }, [data, storageKey, onSave, shouldAutosave]);

  // Restore from localStorage
  const restoreDraft = useCallback((): T | null => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log(`[Autosave] Draft restored from ${storageKey}`);
        return parsed;
      }
    } catch (error) {
      console.error('[Autosave] Error restoring draft:', error);
    }
    return null;
  }, [storageKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_timestamp`);
      lastSaveRef.current = '';
      console.log(`[Autosave] Draft cleared from ${storageKey}`);
    } catch (error) {
      console.error('[Autosave] Error clearing draft:', error);
    }
  }, [storageKey]);

  // Get draft timestamp
  const getDraftTimestamp = useCallback((): Date | null => {
    try {
      const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
      if (timestamp) {
        return new Date(timestamp);
      }
    } catch (error) {
      console.error('[Autosave] Error getting draft timestamp:', error);
    }
    return null;
  }, [storageKey]);

  // Check if draft exists
  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  // Periodic autosave
  useEffect(() => {
    if (interval > 0) {
      autosaveTimerRef.current = setInterval(() => {
        saveDraft();
      }, interval);

      return () => {
        if (autosaveTimerRef.current) {
          clearInterval(autosaveTimerRef.current);
        }
      };
    }
  }, [interval, saveDraft]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dataString = JSON.stringify(data);
      const hasUnsavedChanges = dataString !== lastSaveRef.current;

      // Save if there are changes
      if (hasUnsavedChanges) {
        saveDraft();
      }

      // Show confirmation dialog only if there are actually unsaved changes
      if (hasUnsavedChanges && shouldAutosave(data)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraft, data, shouldAutosave]);

  return {
    saveDraft,
    restoreDraft,
    clearDraft,
    getDraftTimestamp,
    hasDraft
  };
}
