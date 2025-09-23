// utils/indexedDB.js
class DataTransformerDB {
    constructor() {
        this.dbName = 'DataTransformerDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;

                // Create files object store
                if (!this.db.objectStoreNames.contains('files')) {
                    const fileStore = this.db.createObjectStore('files', {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // Create indexes
                    fileStore.createIndex('fileName', 'fileName', { unique: false });
                    fileStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                    fileStore.createIndex('fileType', 'fileType', { unique: false });
                }

                // Create processed data object store
                if (!this.db.objectStoreNames.contains('processedData')) {
                    const dataStore = this.db.createObjectStore('processedData', {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    dataStore.createIndex('fileId', 'fileId', { unique: false });
                    dataStore.createIndex('processedDate', 'processedDate', { unique: false });
                }
            };
        });
    }

    // Helper: read a File/Blob to ArrayBuffer (returns a Promise)
    _readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error);
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    }

    // Save file (reads file first, then does DB transaction)
    async saveFile(file, processedData = null, columns = null) {
        if (!this.db) await this.init();

        // Read file to arrayBuffer first (avoid holding a transaction while async op happens)
        const arrayBuffer = await this._readFileAsArrayBuffer(file);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files', 'processedData'], 'readwrite');
            const fileStore = transaction.objectStore('files');
            const dataStore = transaction.objectStore('processedData');

            // Prepare file data
            const fileData = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadDate: new Date().toISOString(),
                fileContent: arrayBuffer, // ArrayBuffer
                lastModified: file.lastModified
            };

            let savedFileId = null;
            let savedDataId = null;

            // Add file
            const fileRequest = fileStore.add(fileData);
            fileRequest.onsuccess = (ev) => {
                savedFileId = ev.target.result;

                // If processed data is provided, queue it in the same transaction
                if (processedData && columns) {
                    const processedDataObj = {
                        fileId: savedFileId,
                        data: processedData,
                        columns: columns,
                        processedDate: new Date().toISOString()
                    };

                    const dataRequest = dataStore.add(processedDataObj);
                    dataRequest.onsuccess = (e) => {
                        savedDataId = e.target.result;
                        // don't resolve here — wait for transaction.oncomplete to ensure durability
                    };
                    dataRequest.onerror = () => {
                        // Let transaction.onerror handle reject
                        console.error('Error adding processedData:', dataRequest.error);
                    };
                }
            };

            fileRequest.onerror = () => {
                // Add failed
                reject(fileRequest.error);
            };

            transaction.oncomplete = () => {
                // All queued requests finished successfully
                if (processedData && columns) {
                    resolve({ fileId: savedFileId, dataId: savedDataId });
                } else {
                    resolve({ fileId: savedFileId });
                }
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            transaction.onabort = () => {
                reject(new Error('Transaction aborted'));
            };
        });
    }

    async getFile(fileId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.get(fileId);

            request.onsuccess = () => {
                if (request.result) {
                    const fileData = request.result;
                    // Convert ArrayBuffer back to File
                    const blob = new Blob([fileData.fileContent], { type: fileData.fileType });
                    const file = new File([blob], fileData.fileName, {
                        type: fileData.fileType,
                        lastModified: fileData.lastModified
                    });

                    resolve({
                        ...fileData,
                        file: file
                    });
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    async getAllFiles() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async getProcessedData(fileId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['processedData'], 'readonly');
            const store = transaction.objectStore('processedData');
            const index = store.index('fileId');
            const request = index.getAll(IDBKeyRange.only(fileId));

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async saveProcessedData(fileId, data, columns, transformationHistory = []) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['processedData'], 'readwrite');
            const store = transaction.objectStore('processedData');

            const processedDataObj = {
                fileId: fileId,
                data: data,
                columns: columns,
                transformationHistory: transformationHistory,
                processedDate: new Date().toISOString()
            };

            const request = store.add(processedDataObj);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(fileId) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files', 'processedData'], 'readwrite');
            const fileStore = transaction.objectStore('files');
            const dataStore = transaction.objectStore('processedData');

            // Delete file
            const fileRequest = fileStore.delete(fileId);
            fileRequest.onerror = () => {
                console.error('Error deleting file:', fileRequest.error);
            };

            // Delete associated processed data via index cursor
            const index = dataStore.index('fileId');
            const range = IDBKeyRange.only(fileId);
            const cursorRequest = index.openCursor(range);
            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            cursorRequest.onerror = () => {
                console.error('Error iterating processedData for delete:', cursorRequest.error);
            };

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(new Error('Transaction aborted'));
        });
    }

    async clearAllData() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files', 'processedData'], 'readwrite');

            const fileStore = transaction.objectStore('files');
            const dataStore = transaction.objectStore('processedData');

            fileStore.clear().onerror = (e) => console.error('clear files error', e);
            dataStore.clear().onerror = (e) => console.error('clear data error', e);

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getStorageStats() {
        if (!this.db) await this.init();

        const files = await this.getAllFiles();
        const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);

        return {
            fileCount: files.length,
            totalSize: totalSize,
            formattedSize: this.formatFileSize(totalSize)
        };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export singleton instance
export const dataDB = new DataTransformerDB();
