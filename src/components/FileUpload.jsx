import React, { useCallback, useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useIndexedDB } from '../hooks/useIndexedDB';

const FileUpload = ({ onFileUpload, isLoading = false, maxSize = 100 * 1024 * 1024 }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef(null);

    const { saveFile, isInitialized } = useIndexedDB();

    // combined loading state
    const loading = !!isLoading || !!isSaving;

    const validateFile = (file) => {
        if (!file) return false;
        const allowedTypes = ['csv', 'tsv', 'json'];
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            toast.error('Please upload a CSV, TSV, or JSON file');
            return false;
        }

        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            toast.error(`File size exceeds ${maxSizeMB}MB limit`);
            return false;
        }

        return true;
    };

    const handleFileSelect = useCallback(
        async (file) => {
            if (!file) return;
            if (!validateFile(file)) return;

            if (!isInitialized) {
                toast.error('Browser storage is not ready. Please try again in a moment.');
                return;
            }

            setIsSaving(true);
            try {
                // Save file to IndexedDB using hook
                const result = await saveFile(file);
                toast.success(`File "${file.name}" saved to browser storage`);

                // Call parent callback so it can parse/process file.
                // Keep signature flexible: (file, saveResult)
                if (typeof onFileUpload === 'function') {
                    try {
                        onFileUpload(file, result);
                    } catch (err) {
                        // Parent callback may throw — surface an error toast but don't crash
                        console.error('onFileUpload callback error:', err);
                    }
                }
            } catch (error) {
                console.error('Failed to save file to IndexedDB:', error);
                toast.error('Could not save the file to browser storage.');
            } finally {
                setIsSaving(false);
            }
        },
        [maxSize, saveFile, isInitialized, onFileUpload]
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files || []);
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleFileInputChange = useCallback(
        (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
            // Reset the input so same file can be re-selected
            e.target.value = '';
        },
        [handleFileSelect]
    );

    const openFileDialog = useCallback(() => {
        if (inputRef.current && !loading) inputRef.current.click();
    }, [loading]);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            <Card
                className={`relative border-2 border-dashed transition-all duration-200 ${
                    isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-gray-400'
                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                                isDragOver ? 'bg-blue-100' : 'bg-gray-100'
                            }`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            ) : (
                                <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isSaving ? 'Saving to browser...' : isLoading ? 'Processing...' : 'Drag and drop your file here'}
                            </h3>
                            <p className="text-gray-600">Upload CSV, TSV, or JSON files up to {formatFileSize(maxSize)}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">or</span>
                        </div>

                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,.tsv,.json"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={loading}
                        />

                        <Button onClick={openFileDialog} disabled={loading} className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Browse Files</span>
                        </Button>

                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4">
                            <AlertCircle className="w-4 h-4" />
                            <span>All processing happens locally in your browser - no data is uploaded</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* File type info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-medium text-green-800">CSV Files</div>
                    <div className="text-green-600">Comma-separated values with auto-delimiter detection</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-medium text-blue-800">TSV Files</div>
                    <div className="text-blue-600">Tab-separated values for structured data</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="font-medium text-purple-800">JSON Files</div>
                    <div className="text-purple-600">Array of objects with consistent schema</div>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
