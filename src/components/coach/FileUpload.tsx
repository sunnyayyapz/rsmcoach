import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.label
            key="upload-zone"
            htmlFor="file-upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`upload-zone flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[240px] ${
              isDragging ? 'upload-zone-active' : ''
            }`}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              {isDragging ? (
                <Image className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </motion.div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                {isDragging ? 'Drop your image here' : 'Upload your homework'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to select • JPG, PNG
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Camera className="w-4 h-4" />
              <span>Take a clear photo of the problem</span>
            </div>
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden bg-card border border-border shadow-sm"
          >
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <img
              src={preview}
              alt="Uploaded homework"
              className="w-full h-auto max-h-[300px] object-contain"
            />
            
            <div className="p-4 flex gap-3">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
                disabled={isProcessing}
              >
                Choose different
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                    />
                    Processing...
                  </>
                ) : (
                  'Extract problem'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
