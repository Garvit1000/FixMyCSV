// hooks/useIndexedDB.js
import { useState, useCallback, useEffect } from 'react';
import { dataDB } from '../utils/indexedDB'; // Import the database utility

export const useIndexedDB = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [savedFiles, setSavedFiles] = useState([]);
    const [storageStats, setStorageStats] = useState({ fileCount: 0, totalSize: 0, formattedSize: '0 Bytes' });

    // Initialize IndexedDB on first use
    useEffect(() => {
        const initDB = async () => {
            try {
                await dataDB.init();
                setIsInitialized(true);
                await refreshSavedFiles();
            } catch (error) {
                console.error('Failed to initialize IndexedDB:', error);
            }
        };

        initDB();
    }, []);

    // Refresh saved files and storage stats
    const refreshSavedFiles = useCallback(async () => {
        if (!isInitialized) return;

        try {
            const files = await dataDB.getAllFiles();
            setSavedFiles(files);

            const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
            setStorageStats({
                fileCount: files.length,
                totalSize: totalSize,
                formattedSize: dataDB.formatFileSize(totalSize)
            });
        } catch (error) {
            console.error('Error refreshing saved files:', error);
        }
    }, [isInitialized]);

    // Save file to IndexedDB
    const saveFile = useCallback(async (file, processedData = null, columns = null) => {
        if (!isInitialized) {
            throw new Error('IndexedDB not initialized');
        }

        try {
            const result = await dataDB.saveFile(file, processedData, columns);
            await refreshSavedFiles(); // Refresh the list
            return result;
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }, [isInitialized, refreshSavedFiles]);

    // Load file from IndexedDB
    const loadFile = useCallback(async (fileId) => {
        if (!isInitialized) {
            throw new Error('IndexedDB not initialized');
        }

        try {
            const fileData = await dataDB.getFile(fileId);
            return fileData;
        } catch (error) {
            console.error('Error loading file:', error);
            throw error;
        }
    }, [isInitialized]);

    // Delete file from IndexedDB
    const deleteFile = useCallback(async (fileId) => {
        if (!isInitialized) {
            throw new Error('IndexedDB not initialized');
        }

        try {
            await dataDB.deleteFile(fileId);
            await refreshSavedFiles(); // Refresh the list
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }, [isInitialized, refreshSavedFiles]);

    // Save processed data
    const saveProcessedData = useCallback(async (fileId, data, columns, transformationHistory = []) => {
        if (!isInitialized) {
            throw new Error('IndexedDB not initialized');
        }

        try {
            const result = await dataDB.saveProcessedData(fileId, data, columns, transformationHistory);
            return result;
        } catch (error) {
            console.error('Error saving processed data:', error);
            throw error;
        }
    }, [isInitialized]);

    // Load processed data for a file
    const loadProcessedData = useCallback(async (fileId) => {
        if (!isInitialized) {
            throw new Error('IndexedDB not initialized');
        }

        try {
            const processedData = await dataDB.getProcessedData(fileId);
            return processedData;
        } catch (error) {
            console.error('Error loading processed data:', error);
            throw error;
        }
    }, [isInitialized]);

    // Clear all data from IndexedDB
    const clearAllData = useCallback(async () => {
        if (!isInitialized) {
            throw new Error('IndexedDB not initialized');
        }

        try {
            await dataDB.clearAllData();
            await refreshSavedFiles();
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            throw error;
        }
    }, [isInitialized, refreshSavedFiles]);

    // Check if browser supports IndexedDB
    const isSupported = useCallback(() => {
        return 'indexedDB' in window;
    }, []);

    return {
        // State
        isInitialized,
        savedFiles,
        storageStats,

        // Methods
        saveFile,
        loadFile,
        deleteFile,
        saveProcessedData,
        loadProcessedData,
        clearAllData,
        refreshSavedFiles,
        isSupported
    };
};