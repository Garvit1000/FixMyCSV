import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import './App.css';

// Components
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import TransformationToolbar from './components/TransformationToolbar';
import ChartVisualization from './components/ChartVisualization';
import ActionHistory from './components/ActionHistory';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Download, BarChart3, Activity, TrendingUp, Database,Hexagon,Twitter,GithubIcon } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import {Footer} from './components/ui/footer'


// Hook for IndexedDB
import { useIndexedDB } from './hooks/useIndexedDB';

function App() {
    // app state
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    // Chart configuration state
    const [selectedColumn, setSelectedColumn] = useState('');
    const [chartType, setChartType] = useState('bar');

    // persist / load helpers from hook
    const { saveProcessedData, loadProcessedData } = useIndexedDB();

    // track current file id in indexedDB (set when file is saved/uploaded)
    const [currentFileId, setCurrentFileId] = useState(null);

    // --- Utility: create a minimal history entry object ---
    const makeHistoryEntry = useCallback((actionLabel, newData, newColumns) => {
        return {
            action: actionLabel,
            data: Array.isArray(newData) ? newData : [],
            columns: Array.isArray(newColumns) ? newColumns : [],
            timestamp: new Date().toLocaleString(),
        };
    }, []);

    // Persist processed data for current fileId (if available).
    // transformationHistory param is optional — we'll pass recent compact history.
    const persistProcessedData = useCallback(async (fileId, processedRows, cols, transformationHistory = []) => {
        if (!fileId) {
            // no file id — cannot persist under a file; this can happen if file wasn't saved to indexedDB
            console.warn('No fileId available; skipping persistence of processed data.');
            return;
        }

        try {
            // Save a snapshot of processed data and columns, plus a compact transformation history
            await saveProcessedData(fileId, processedRows, cols, transformationHistory);
        } catch (err) {
            console.error('Failed to persist processed data to IndexedDB:', err);
            toast.error('Could not persist transformation to browser storage.');
        }
    }, [saveProcessedData]);

    // --- History management (keeps in-memory history and updates historyIndex) ---
    const addToHistory = useCallback((action, newData, newColumns) => {
        // create history entry (store columns as simple header strings for compactness)
        const columnHeaders = Array.isArray(newColumns)
            ? newColumns.map(c => (typeof c === 'string' ? c : (c.header ?? String(c))))
            : [];

        const newEntry = makeHistoryEntry(action, newData, columnHeaders);

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newEntry);

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        // Persist processed data snapshot & compact transformation history (action + timestamp only)
        const compactHistory = newHistory.map(h => ({ action: h.action, timestamp: h.timestamp }));
        if (currentFileId) {
            persistProcessedData(currentFileId, newData, columnHeaders, compactHistory);
        }
    }, [history, historyIndex, makeHistoryEntry, currentFileId, persistProcessedData]);

    // --- When user uploads a file, this handler is called by FileUpload.
    // FileUpload now calls onFileUpload(file, saveResult) where saveResult contains fileId (if saved).
    const handleFileUpload = useCallback((file, saveResult) => {
        if (!file) return;

        setIsLoading(true);
        const fileExtension = file.name.split('.').pop().toLowerCase();
        setFileName(file.name);
        setFileType(fileExtension);

        // store fileId returned by FileUpload / saveFile
        const fileId = saveResult?.fileId ?? null;
        setCurrentFileId(fileId);

        const finalizeParsedData = async (headers, formattedData) => {
            const formattedColumns = headers.map((header, index) => ({
                id: `col_${index}`,
                header: header || `Column ${index + 1}`,
                accessorKey: `col_${index}`,
            }));

            setColumns(formattedColumns);
            setData(formattedData);

            // Set default selected column to first column
            if (formattedColumns.length > 0) {
                setSelectedColumn(formattedColumns[0].accessorKey);
            }

            // add to history and persist initial processed snapshot
            addToHistory('File Uploaded', formattedData, headers);

            // Also persist processed data explicitly (in case FileUpload only saved the raw file)
            const compactHistory = [{ action: 'File Uploaded', timestamp: new Date().toLocaleString() }];
            if (fileId) {
                await persistProcessedData(fileId, formattedData, headers, compactHistory);
            }

            toast.success(`Successfully loaded ${formattedData.length} rows`);
            setIsLoading(false);
        };

        if (fileExtension === 'csv' || fileExtension === 'tsv') {
            Papa.parse(file, {
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        const headers = results.data[0].map(h => (h == null ? '' : String(h)));
                        const rows = results.data
                            .slice(1)
                            .filter(row => Array.isArray(row) && row.some(cell => cell !== '' && cell != null));

                        const formattedData = rows.map((row, rowIndex) => {
                            const rowData = { id: rowIndex };
                            headers.forEach((_h, colIndex) => {
                                rowData[`col_${colIndex}`] = row[colIndex] ?? '';
                            });
                            return rowData;
                        });

                        finalizeParsedData(headers, formattedData);
                    } else {
                        toast.error('No data found in file');
                        setIsLoading(false);
                    }
                },
                header: false,
                skipEmptyLines: true,
                delimiter: fileExtension === 'tsv' ? '\t' : ',',
            });
        } else if (fileExtension === 'json') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    if (Array.isArray(jsonData) && jsonData.length > 0) {
                        const headers = Object.keys(jsonData[0]);
                        const formattedData = jsonData.map((item, rowIndex) => {
                            const rowData = { id: rowIndex };
                            headers.forEach((header, colIndex) => {
                                rowData[`col_${colIndex}`] = item[header] ?? '';
                            });
                            return rowData;
                        });

                        await finalizeParsedData(headers, formattedData);
                    } else {
                        toast.error('JSON must be an array of objects with consistent schema');
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Error parsing JSON file');
                    setIsLoading(false);
                }
            };
            reader.onerror = () => {
                toast.error('Error reading JSON file');
                setIsLoading(false);
            };
            reader.readAsText(file);
        } else {
            toast.error('Unsupported file type');
            setIsLoading(false);
        }
    }, [addToHistory, persistProcessedData]);

    // --- Load latest processed snapshot for a given fileId (if exists) ---
    const loadLatestProcessedForFile = useCallback(async (fileId) => {
        if (!fileId) return;

        try {
            const processedEntries = await loadProcessedData(fileId); // returns array of processedData records
            if (Array.isArray(processedEntries) && processedEntries.length > 0) {
                // pick the latest entry by processedDate (most recent)
                processedEntries.sort((a, b) => new Date(a.processedDate) - new Date(b.processedDate));
                const latest = processedEntries[processedEntries.length - 1];

                // restore columns and data
                const savedCols = Array.isArray(latest.columns) ? latest.columns : [];
                const formattedColumns = savedCols.map((header, index) => ({
                    id: `col_${index}`,
                    header,
                    accessorKey: `col_${index}`,
                }));

                // best-effort: expect latest.data to be array of row objects with accessor keys
                const restoredData = Array.isArray(latest.data) ? latest.data : [];

                setColumns(formattedColumns);
                setData(restoredData);

                // Set default selected column
                if (formattedColumns.length > 0) {
                    setSelectedColumn(formattedColumns[0].accessorKey);
                }

                // Reconstruct history from transformationHistory if available, else create single entry
                const reconstructedHistory = Array.isArray(latest.transformationHistory) && latest.transformationHistory.length > 0
                    ? latest.transformationHistory.map((h, idx) => ({
                        action: h.action ?? `Step ${idx + 1}`,
                        data: [], // avoid storing giant data inside each history item here; keep data minimal
                        columns: savedCols,
                        timestamp: h.timestamp ?? ''
                    }))
                    : [ makeHistoryEntry('Restored from browser storage', restoredData, savedCols) ];

                setHistory(reconstructedHistory);
                setHistoryIndex(reconstructedHistory.length - 1);

                toast.success('Loaded saved state from browser storage');
            }
        } catch (err) {
            console.error('Error loading processed data for file:', err);
        }
    }, [loadProcessedData, makeHistoryEntry]);

    // If user sets currentFileId (e.g., re-uploaded a file that was previously saved), load latest snapshot
    useEffect(() => {
        if (currentFileId) {
            loadLatestProcessedForFile(currentFileId);
        }
    }, [currentFileId, loadLatestProcessedForFile]);

    // --- Transformations: update data + columns + history + persist ---
    const splitColumn = useCallback((columnIndex, delimiter) => {
        if (!data.length) return;

        const columnKey = `col_${columnIndex}`;
        const newData = data.map(row => {
            const cellValue = row[columnKey] ?? '';
            const parts = String(cellValue).split(delimiter);
            const newRow = { ...row };
            parts.forEach((part, idx) => {
                newRow[`${columnKey}_split_${idx}`] = part?.trim() ?? '';
            });
            return newRow;
        });

        const maxParts = Math.max(...data.map(row => String(row[columnKey] ?? '').split(delimiter).length));
        const newColumns = [...columns];
        const originalColumn = columns[columnIndex];

        for (let i = 0; i < maxParts; i++) {
            newColumns.push({
                id: `${columnKey}_split_${i}`,
                header: `${originalColumn.header}_${i + 1}`,
                accessorKey: `${columnKey}_split_${i}`,
            });
        }

        setData(newData);
        setColumns(newColumns);

        addToHistory(`Split column "${originalColumn.header}" by "${delimiter}"`, newData, newColumns.map(c => c.header));
    }, [data, columns, addToHistory]);

    const mergeColumns = useCallback((columnIndices, separator = ' ', newColumnName = 'Merged') => {
        if (!data.length || columnIndices.length < 2) return;

        const columnKeys = columnIndices.map(index => `col_${index}`);
        const newColId = `merged_${Date.now()}`;

        const newData = data.map(row => {
            const values = columnKeys.map(key => row[key] ?? '');
            const mergedValue = values.join(separator);
            return { ...row, [newColId]: mergedValue };
        });

        const newColumns = [
            ...columns,
            { id: newColId, header: newColumnName, accessorKey: newColId }
        ];

        setData(newData);
        setColumns(newColumns);

        addToHistory(`Merged columns into "${newColumnName}"`, newData, newColumns.map(c => c.header));
    }, [data, columns, addToHistory]);

    const mapValues = useCallback((columnIndex, mappings) => {
        if (!data.length) return;

        const columnKey = `col_${columnIndex}`;
        const newData = data.map(row => {
            const currentValue = row[columnKey] ?? '';
            const mappedValue = Object.prototype.hasOwnProperty.call(mappings, currentValue) ? mappings[currentValue] : currentValue;
            return { ...row, [columnKey]: mappedValue };
        });

        setData(newData);
        const originalColumn = columns[columnIndex];
        addToHistory(`Mapped values in column "${originalColumn.header}"`, newData, columns.map(c => c.header));
    }, [data, columns, addToHistory]);

    const deduplicate = useCallback((columnIndices, keepFirst = true) => {
        if (!data.length) return;

        const columnKeys = columnIndices.map(index => `col_${index}`);
        const seen = new Set();
        const newDataArr = [];

        const dataToProcess = keepFirst ? data : [...data].reverse();

        dataToProcess.forEach(row => {
            const key = columnKeys.map(colKey => row[colKey] ?? '').join('|');
            if (!seen.has(key)) {
                seen.add(key);
                newDataArr.push(row);
            }
        });

        const finalData = keepFirst ? newDataArr : newDataArr.reverse();
        const removedCount = data.length - finalData.length;

        setData(finalData);
        addToHistory(`Removed ${removedCount} duplicate rows`, finalData, columns.map(c => c.header));
    }, [data, columns, addToHistory]);

    // --- Undo/Redo (operates on history entries, rehydrates data/columns when stepping) ---
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setData(prevState.data);
            setColumns(prevState.columns.map((header, index) => ({
                id: `col_${index}`,
                header,
                accessorKey: `col_${index}`,
            })));
            setHistoryIndex(historyIndex - 1);
            // Persist undo state
            if (currentFileId) {
                const compactHistory = history.slice(0, historyIndex).map(h => ({ action: h.action, timestamp: h.timestamp }));
                persistProcessedData(currentFileId, prevState.data, prevState.columns, compactHistory);
            }
        }
    }, [history, historyIndex, currentFileId, persistProcessedData]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setData(nextState.data);
            setColumns(nextState.columns.map((header, index) => ({
                id: `col_${index}`,
                header,
                accessorKey: `col_${index}`,
            })));
            setHistoryIndex(historyIndex + 1);
            // Persist redo state
            if (currentFileId) {
                const compactHistory = history.slice(0, historyIndex + 2).map(h => ({ action: h.action, timestamp: h.timestamp }));
                persistProcessedData(currentFileId, nextState.data, nextState.columns, compactHistory);
            }
        }
    }, [history, historyIndex, currentFileId, persistProcessedData]);

    // --- Export functionality (unchanged) ---
    const exportData = useCallback((format = 'csv') => {
        if (!data.length) return;

        if (format === 'csv') {
            const headers = columns.map(col => col.header);
            const csvData = [ headers, ...data.map(row => columns.map(col => row[col.accessorKey] ?? '')) ];
            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, fileName.replace(/\.[^/.]+$/, '') + '-cleaned.csv');
        } else if (format === 'json') {
            const jsonData = data.map(row => {
                const obj = {};
                columns.forEach(col => {
                    obj[col.header] = row[col.accessorKey] ?? '';
                });
                return obj;
            });
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            saveAs(blob, fileName.replace(/\.[^/.]+$/, '') + '-cleaned.json');
        }

        toast.success(`File exported as ${format.toUpperCase()}`);
    }, [data, columns, fileName]);

    // Chart data preparation with selected column
    const chartData = useMemo(() => {
        if (!data.length || !columns.length || !selectedColumn) return null;

        const selectedCol = columns.find(col => col.accessorKey === selectedColumn);
        if (!selectedCol) return null;

        const frequencies = {};
        let numericData = [];
        let isNumericColumn = true;

        data.forEach(row => {
            const value = row[selectedColumn] ?? 'Empty';
            const numValue = parseFloat(value);

            if (!isNaN(numValue) && isFinite(numValue)) {
                numericData.push(numValue);
            } else {
                isNumericColumn = false;
            }

            frequencies[String(value)] = (frequencies[String(value)] || 0) + 1;
        });

        // For numeric columns, create histogram-like data
        if (isNumericColumn && numericData.length > 0) {
            const sorted = [...numericData].sort((a, b) => a - b);
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            const range = max - min;
            const binCount = Math.min(10, Math.ceil(Math.sqrt(numericData.length)));
            const binSize = range / binCount;

            const bins = {};
            for (let i = 0; i < binCount; i++) {
                const binStart = min + (i * binSize);
                const binEnd = min + ((i + 1) * binSize);
                const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
                bins[binLabel] = 0;
            }

            numericData.forEach(value => {
                const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
                const binStart = min + (binIndex * binSize);
                const binEnd = min + ((binIndex + 1) * binSize);
                const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
                bins[binLabel]++;
            });

            const labels = Object.keys(bins);
            const values = labels.map(l => bins[l]);

            return {
                labels,
                datasets: [{
                    label: `${selectedCol.header} Distribution`,
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                }]
            };
        } else {
            // For categorical data, show top 10 most frequent values
            const sortedEntries = Object.entries(frequencies)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);

            const labels = sortedEntries.map(([label]) => label);
            const values = sortedEntries.map(([,count]) => count);

            return {
                labels,
                datasets: [{
                    label: `${selectedCol.header} Frequency`,
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                }]
            };
        }
    }, [data, columns, selectedColumn]);

    // Get data summary statistics
    const dataSummary = useMemo(() => {
        if (!data.length || !columns.length) return null;

        const totalRows = data.length;
        const totalColumns = columns.length;
        const fileSize = fileName ? `${(JSON.stringify(data).length / 1024).toFixed(1)} KB` : 'Unknown';

        return { totalRows, totalColumns, fileSize };
    }, [data, columns, fileName]);

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Toaster position="top-center" />

            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                            <h1 className="text-base sm:text-lg font-medium text-black">FixMyCSV</h1>
                        </div>
                        <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">Dashboard</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">Docs</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">Support</a>
                            <Button size="sm" className="bg-black hover:bg-gray-800 text-white text-sm h-8 px-3 sm:px-4 rounded-md">
                                Soon
                            </Button>
                        </nav>
                        {/* Mobile menu button */}
                        <div className="sm:hidden">
                            <Button size="sm" className="bg-black hover:bg-gray-800 text-white text-xs h-7 px-3 rounded-md">
                                Soon
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8 lg:py-12">
                {data.length === 0 ? (
                    /* Hero Section */
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8 sm:mb-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-50 mb-4 sm:mb-6">
                                <Database className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-3 sm:mb-4 tracking-tight px-4">
                                Transform Your Data
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                                Upload CSV, TSV, or JSON files to analyze and transform your datasets with professional-grade tools.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
                            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} maxSize={100 * 1024 * 1024} />
                        </div>
                    </div>
                ) : (
                    /* Main Application Layout */
                    <div className="space-y-6 sm:space-y-8">
                        {/* Stats Overview */}
                        {dataSummary && (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">Rows</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-black mt-1">{dataSummary.totalRows.toLocaleString()}</p>
                                        </div>
                                        <Database className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">Columns</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-black mt-1">{dataSummary.totalColumns}</p>
                                        </div>
                                        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">Size</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-black mt-1">{dataSummary.fileSize}</p>
                                        </div>
                                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-500">Type</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-black mt-1 uppercase">{fileType || 'N/A'}</p>
                                        </div>
                                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
                            {/* Main Content */}
                            <div className="xl:col-span-3 space-y-6 sm:space-y-8">
                                {/* File Upload */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                                    <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} maxSize={100 * 1024 * 1024} />
                                </div>

                                {/* Data Table */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                <h3 className="text-base sm:text-lg font-medium text-black">Data</h3>
                                                <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                    {data.length} rows
                                                </span>
                                                    <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 truncate max-w-32">
                                                    {fileName}
                                                </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportData('csv')}
                                                    className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Download className="w-3 h-3 mr-1" />
                                                    CSV
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportData('json')}
                                                    className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Download className="w-3 h-3 mr-1" />
                                                    JSON
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                                        <TransformationToolbar
                                            columns={columns}
                                            onSplitColumn={splitColumn}
                                            onMergeColumns={mergeColumns}
                                            onMapValues={mapValues}
                                            onDeduplicate={deduplicate}
                                        />
                                    </div>

                                    <div className="overflow-x-auto">
                                        <DataPreview data={data} columns={columns} />
                                    </div>
                                </div>

                                {/* Visualization */}
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-medium text-black">Visualization</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500">Data distribution</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                <label htmlFor="column-select" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                                                    Column
                                                </label>
                                                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                                                    <SelectTrigger className="w-32 sm:w-40 h-7 sm:h-8 text-xs sm:text-sm border-gray-200">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {columns.map((column) => (
                                                            <SelectItem
                                                                key={column.accessorKey}
                                                                value={column.accessorKey}
                                                                className="text-xs sm:text-sm"
                                                            >
                                                                {column.header}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {selectedColumn && (
                                            <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    Distribution for{' '}
                                                    <span className="font-medium text-black">
                                                    {columns.find(col => col.accessorKey === selectedColumn)?.header}
                                                </span>
                                                    {' '}({data.length} records)
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        {chartData ? (
                                            <ChartVisualization data={chartData} type={chartType} />
                                        ) : (
                                            <div className="flex items-center justify-center h-48 sm:h-64 border border-dashed border-gray-200 rounded-lg">
                                                <div className="text-center px-4">
                                                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                                    <p className="text-xs sm:text-sm text-gray-500">Select a column to visualize data</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="xl:col-span-1">
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-20 sm:top-24">
                                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center space-x-2">
                                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                                            <h3 className="font-medium text-black text-xs sm:text-sm">History</h3>
                                        </div>
                                    </div>
                                    <ActionHistory
                                        history={history}
                                        onUndo={undo}
                                        onRedo={redo}
                                        canUndo={historyIndex > 0}
                                        canRedo={historyIndex < history.length - 1}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer
                logo={<Hexagon className="h-5 w-5" />}
                brandName="FixMyCSV"
                socialLinks={[
                    {
                        icon: <Twitter className="h-4 w-4" />,
                        href: "https://twitter.com",
                        label: "Twitter",
                    },
                    {
                        icon: <GithubIcon className="h-4 w-4" />,
                        href: "https://github.com",
                        label: "GitHub",
                    },
                ]}
                mainLinks={[
                    { href: "/products", label: "Products" },
                    { href: "/about", label: "About" },
                    { href: "/blog", label: "Blog" },
                    { href: "/contact", label: "Contact" },
                ]}
                legalLinks={[
                    { href: "/privacy", label: "Privacy" },
                    { href: "/terms", label: "Terms" },
                ]}
                copyright={{
                    text: "© 2025 FixMyCSV",
                    license: "All rights reserved",
                }}
            />
        </div>
    );
}

export default App;
