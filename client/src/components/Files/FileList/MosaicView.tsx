import React, { useState } from 'react';
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

interface MosaicViewProps {
  files: TFile[];
  onFileClick?: (file: TFile) => void;
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

export default function MosaicView({ files, onFileClick }: MosaicViewProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  if (!files || files.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-text-secondary">No files available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {files.map((file) => (
        <div
          key={file.file_id}
          className="group relative flex h-32 w-full flex-col overflow-hidden rounded-md border border-border-medium bg-surface-secondary shadow-sm transition-all duration-200 hover:shadow-md"
          onMouseEnter={() => setHoveredFile(file.file_id)}
          onMouseLeave={() => setHoveredFile(null)}
          onClick={() => onFileClick?.(file)}
        >
          {getFilePreview(file)}

          <div className="flex flex-col p-2">
            <div className="flex items-center justify-between">
              <h4 className="truncate text-xs font-medium text-text-primary">{file.filename}</h4>
              <Button
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClick?.(file);
                }}
              >
                <AlertCircle className="icon-sm" />
              </Button>
            </div>
            <p className="truncate text-xs text-text-secondary">
              {file.bytes ? `${(file.bytes / 1024).toFixed(1)} KB` : 'Unknown size'}
            </p>
          </div>

          {/* Hover overlay */}
          {hoveredFile === file.file_id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-sm font-medium text-white">Click to preview</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
