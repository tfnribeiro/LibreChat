import { useEffect, useMemo, useState } from 'react';
import type { TFile } from 'librechat-data-provider';
import {
  FileText,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileSearch,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@librechat/client';

interface FilesMosaicViewProps {
  files: TFile[];
  onFileClick?: (file: TFile) => void;
  /** Enable selectable mode (e.g., in conversation) */
  selectable?: boolean;
  /** If selectable, default to all selected */
  defaultAllSelected?: boolean;
  /** Optional controlled selection set */
  selectedIds?: Set<string>;
  /** Selection change callback to bubble up active files */
  onSelectionChange?: (ids: string[]) => void;
  /** If true, show preview behavior on hover rather than click */
  previewOnHover?: boolean;
  /** Optional grid class override for layout */
  gridClassName?: string;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image':
      return <ImageIcon className="icon-lg" />;
    case 'video':
      return <FileVideo className="icon-lg" />;
    case 'audio':
      return <FileAudio className="icon-lg" />;
    case 'pdf':
      return <FileText className="icon-lg" />;
    case 'text':
      return <FileText className="icon-lg" />;
    case 'code':
      return <FileCode className="icon-lg" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="icon-lg" />;
    case 'archive':
      return <FileArchive className="icon-lg" />;
    case 'document':
      return <FileText className="icon-lg" />;
    default:
      return <FileSearch className="icon-lg" />;
  }
};

const getFilePreview = (file: TFile) => {
  if (file.type === 'image') {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-t-md bg-surface-tertiary">
        <img
          src={file.filepath || '/placeholder-image.jpg'}
          alt={file.filename}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.jpg';
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-t-md bg-surface-tertiary">
      {getFileIcon(file.type ?? 'document')}
    </div>
  );
};

export default function FilesMosaicView({
  files,
  onFileClick,
  selectable = false,
  defaultAllSelected = true,
  selectedIds,
  onSelectionChange,
  previewOnHover = false,
  gridClassName,
}: FilesMosaicViewProps) {
  const getId = (file: TFile, idx: number) =>
    String(
      (file as any).file_id ??
        (file as any).id ??
        (file as any)._id ??
        (file as any).document_id ??
        (file as any).filepath ??
        (file as any).path ??
        `${(file as any).filename ?? 'file'}-${idx}`,
    );
  // Hover preview is now controlled purely via CSS (group-hover)
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());

  const effectiveSelected = useMemo(
    () => selectedIds ?? internalSelected,
    [selectedIds, internalSelected],
  );

  useEffect(() => {
    if (!selectable) return;
    // Initialize selection when files change
    if (selectedIds == null) {
      const initial = defaultAllSelected
        ? new Set(files.map((f, i) => getId(f, i)))
        : new Set<string>();
      setInternalSelected(initial);
      if (onSelectionChange) {
        onSelectionChange(Array.from(initial));
      }
    } else {
      // If controlled, reflect in callback as well
      if (onSelectionChange) {
        onSelectionChange(Array.from(selectedIds));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const toggleSelect = (fileId: string) => {
    if (!selectable) return;
    if (selectedIds) {
      // Controlled: let parent manage state, just emit
      const next = new Set(selectedIds);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      onSelectionChange?.(Array.from(next));
    } else {
      // Uncontrolled
      setInternalSelected((prev) => {
        const next = new Set(prev);
        if (next.has(fileId)) next.delete(fileId);
        else next.add(fileId);
        onSelectionChange?.(Array.from(next));
        return next;
      });
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-text-secondary">No files available</p>
      </div>
    );
  }

  return (
    <div
      className={
        gridClassName ??
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      }
    >
      {files.map((file, idx) => {
        const id = getId(file, idx);
        const isSelected = effectiveSelected.has(id) && selectable;
        return (
          <div
            key={id}
            className={`${
              isSelected ? 'shadow-md ring-2 ring-accent' : 'shadow-sm'
            } group/file relative flex h-32 w-full cursor-pointer flex-col overflow-hidden rounded-md border border-border-medium bg-surface-secondary transition-all duration-200 hover:shadow-md`}
            onClick={(e) => {
              e.stopPropagation();
              if (selectable) {
                toggleSelect(id);
                return;
              }
              if (!previewOnHover) {
                onFileClick?.(file);
              }
            }}
          >
            {getFilePreview(file)}

            <div className="flex flex-col p-2">
              <div className="flex items-center justify-between">
                <h4 className="truncate text-xs font-medium text-text-primary">{file.filename}</h4>
                {!selectable && (
                  <Button
                    className="opacity-0 group-hover/file:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileClick?.(file);
                    }}
                  >
                    <AlertCircle className="icon-sm" />
                  </Button>
                )}
              </div>
              <p className="truncate text-xs text-text-secondary">
                {file.bytes ? `${(file.bytes / 1024).toFixed(1)} KB` : 'Unknown size'}
              </p>
            </div>

            {/* Selection indicator */}
            {selectable && (
              <div className="pointer-events-none absolute right-1 top-1 rounded bg-black/50 px-1 py-0.5 text-[10px] font-medium text-white">
                {isSelected ? 'Selected' : 'Tap to select'}
              </div>
            )}

            {/* Hover preview cue */}
            {previewOnHover && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover/file:opacity-100">
                <div className="rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                  {file.filename}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
