import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Split, Merge, MapPin, Copy } from 'lucide-react';
import { toast } from 'sonner';

const TransformationToolbar = ({
                                   columns = [],
                                   onSplitColumn = () => {},
                                   onMergeColumns = () => {},
                                   onMapValues = () => {},
                                   onDeduplicate = () => {},
                               }) => {
    const [splitConfig, setSplitConfig] = useState({
        columnIndex: '',
        delimiter: '',
    });

    const [mergeConfig, setMergeConfig] = useState({
        columnIndices: [],
        separator: ' ',
        newColumnName: '',
    });

    const [mapConfig, setMapConfig] = useState({
        columnIndex: '',
        mappings: '',
    });

    const [dedupeConfig, setDedupeConfig] = useState({
        columnIndices: [],
        keepFirst: true,
    });

    const handleSplitColumn = () => {
        if (splitConfig.columnIndex === '' || !splitConfig.delimiter) {
            toast.error('Please select a column and enter a delimiter');
            return;
        }
        const idx = parseInt(splitConfig.columnIndex, 10);
        if (Number.isNaN(idx) || idx < 0 || idx >= columns.length) {
            toast.error('Invalid column selected');
            return;
        }
        onSplitColumn(idx, splitConfig.delimiter);
        setSplitConfig({ columnIndex: '', delimiter: '' });
    };

    const handleMergeColumns = () => {
        if (mergeConfig.columnIndices.length < 2 || !mergeConfig.newColumnName.trim()) {
            toast.error('Please select at least 2 columns and enter a name');
            return;
        }

        const indices = mergeConfig.columnIndices.map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
        if (indices.some((n) => n < 0 || n >= columns.length)) {
            toast.error('One or more selected columns are invalid');
            return;
        }

        onMergeColumns(indices, mergeConfig.separator, mergeConfig.newColumnName.trim());
        setMergeConfig({ columnIndices: [], separator: ' ', newColumnName: '' });
    };

    const handleMapValues = () => {
        if (mapConfig.columnIndex === '' || !mapConfig.mappings.trim()) {
            toast.error('Please select a column and enter mappings');
            return;
        }

        const idx = parseInt(mapConfig.columnIndex, 10);
        if (Number.isNaN(idx) || idx < 0 || idx >= columns.length) {
            toast.error('Invalid column selected');
            return;
        }

        const lines = mapConfig.mappings.split('\n').map((l) => l.trim()).filter(Boolean);
        const mappings = {};

        for (const line of lines) {
            const [oldRaw, newRaw] = line.split('=');
            if (!oldRaw || newRaw === undefined) continue;
            const oldVal = oldRaw.trim();
            const newVal = newRaw.trim();
            if (oldVal) mappings[oldVal] = newVal;
        }

        if (Object.keys(mappings).length === 0) {
            toast.error('Please enter valid mappings (format: old=new)');
            return;
        }

        onMapValues(idx, mappings);
        setMapConfig({ columnIndex: '', mappings: '' });
    };

    const handleDeduplicate = () => {
        if (dedupeConfig.columnIndices.length === 0) {
            toast.error('Please select at least one column');
            return;
        }

        const indices = dedupeConfig.columnIndices.map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
        if (indices.some((n) => n < 0 || n >= columns.length)) {
            toast.error('One or more selected columns are invalid');
            return;
        }

        onDeduplicate(indices, dedupeConfig.keepFirst);
        setDedupeConfig({ columnIndices: [], keepFirst: true });
    };

    const toggleColumnSelection = (columnIndex, configType) => {
        const s = columnIndex.toString();
        if (configType === 'merge') {
            const newIndices = mergeConfig.columnIndices.includes(s)
                ? mergeConfig.columnIndices.filter((idx) => idx !== s)
                : [...mergeConfig.columnIndices, s];
            setMergeConfig({ ...mergeConfig, columnIndices: newIndices });
        } else if (configType === 'dedupe') {
            const newIndices = dedupeConfig.columnIndices.includes(s)
                ? dedupeConfig.columnIndices.filter((idx) => idx !== s)
                : [...dedupeConfig.columnIndices, s];
            setDedupeConfig({ ...dedupeConfig, columnIndices: newIndices });
        }
    };

    return (
        <Card className="p-4">
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Data Transformation Toolbar</h4>
                <p className="text-sm text-gray-600">Apply transformations to clean and reshape your data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Split Column */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 flex-col">
                            <Split className="w-5 h-5 text-blue-600" />
                            <div className="text-center">
                                <div className="font-medium">Split Column</div>
                                <div className="text-xs text-gray-500">Divide column by delimiter</div>
                            </div>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md z-[100]">
                        <DialogHeader>
                            <DialogTitle>Split Column</DialogTitle>
                            <DialogDescription>Divide a column into multiple columns using a delimiter.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative z-[110]">
                                <Label htmlFor="split-column">Select Column</Label>
                                <Select
                                    value={splitConfig.columnIndex}
                                    onValueChange={(value) => setSplitConfig({ ...splitConfig, columnIndex: value })}
                                >
                                    <SelectTrigger className="w-full relative z-[110]" aria-label="Select column to split">
                                        <SelectValue placeholder={columns.length ? 'Choose column to split' : 'No columns available'} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[120] bg-white border border-gray-200 shadow-lg">
                                        {columns.length ? (
                                            columns.map((col, index) => (
                                                <SelectItem key={index} value={index.toString()}>
                                                    {col.header ?? `Column ${index + 1}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="">No columns</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="delimiter">Delimiter</Label>
                                <Input
                                    id="delimiter"
                                    placeholder="e.g., , or \t or | or space"
                                    value={splitConfig.delimiter}
                                    onChange={(e) => setSplitConfig({ ...splitConfig, delimiter: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Use a literal character for delimiter. For tab, press Tab key.</p>
                            </div>

                            <Button onClick={handleSplitColumn} className="w-full">
                                Split Column
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Merge Columns */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 flex-col">
                            <Merge className="w-5 h-5 text-green-600" />
                            <div className="text-center">
                                <div className="font-medium">Merge Columns</div>
                                <div className="text-xs text-gray-500">Combine multiple columns</div>
                            </div>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md z-[100]">
                        <DialogHeader>
                            <DialogTitle>Merge Columns</DialogTitle>
                            <DialogDescription>Combine multiple columns into a single column with a separator.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>Select Columns to Merge</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                                    {columns.length ? (
                                        columns.map((col, index) => {
                                            const selected = mergeConfig.columnIndices.includes(index.toString());
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => toggleColumnSelection(index, 'merge')}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => (e.key === 'Enter' ? toggleColumnSelection(index, 'merge') : null)}
                                                    className={`p-2 border rounded cursor-pointer text-sm transition-colors ${
                                                        selected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {col.header ?? `Column ${index + 1}`}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-gray-500">No columns available</div>
                                    )}
                                </div>

                                {mergeConfig.columnIndices.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {mergeConfig.columnIndices.map((idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {columns[parseInt(idx, 10)]?.header ?? `Column ${idx}`}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="separator">Separator</Label>
                                <Input
                                    id="separator"
                                    placeholder="e.g., space, comma, |"
                                    value={mergeConfig.separator}
                                    onChange={(e) => setMergeConfig({ ...mergeConfig, separator: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="new-column-name">New Column Name</Label>
                                <Input
                                    id="new-column-name"
                                    placeholder="Enter name for merged column"
                                    value={mergeConfig.newColumnName}
                                    onChange={(e) => setMergeConfig({ ...mergeConfig, newColumnName: e.target.value })}
                                />
                            </div>

                            <Button onClick={handleMergeColumns} className="w-full">
                                Merge Columns
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Map Values */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 flex-col">
                            <MapPin className="w-5 h-5 text-purple-600" />
                            <div className="text-center">
                                <div className="font-medium">Map Values</div>
                                <div className="text-xs text-gray-500">Replace values in column</div>
                            </div>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md z-[100]">
                        <DialogHeader>
                            <DialogTitle>Map Values</DialogTitle>
                            <DialogDescription>Replace specific values in a column with new values.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative z-[110]">
                                <Label htmlFor="map-column">Select Column</Label>
                                <Select
                                    value={mapConfig.columnIndex}
                                    onValueChange={(value) => setMapConfig({ ...mapConfig, columnIndex: value })}
                                >
                                    <SelectTrigger className="w-full relative z-[110]" aria-label="Select column to map">
                                        <SelectValue placeholder={columns.length ? 'Choose column to map' : 'No columns available'} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[120] bg-white border border-gray-200 shadow-lg">
                                        {columns.length ? (
                                            columns.map((col, index) => (
                                                <SelectItem key={index} value={index.toString()}>
                                                    {col.header ?? `Column ${index + 1}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="">No columns</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="mappings">Value Mappings</Label>
                                <Textarea
                                    id="mappings"
                                    placeholder={`Enter mappings, one per line:\nold_value=new_value\nFacebook=fb\nTwitter=tw`}
                                    value={mapConfig.mappings}
                                    onChange={(e) => setMapConfig({ ...mapConfig, mappings: e.target.value })}
                                    rows={6}
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: old_value=new_value (one per line)</p>
                            </div>

                            <Button onClick={handleMapValues} className="w-full">
                                Map Values
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Deduplicate */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 flex-col">
                            <Copy className="w-5 h-5 text-red-600" />
                            <div className="text-center">
                                <div className="font-medium">Dedupe</div>
                                <div className="text-xs text-gray-500">Remove duplicate rows</div>
                            </div>
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md z-[100]">
                        <DialogHeader>
                            <DialogTitle>Remove Duplicates</DialogTitle>
                            <DialogDescription>Remove duplicate rows based on selected columns.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>Select Columns for Duplicate Detection</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                                    {columns.length ? (
                                        columns.map((col, index) => {
                                            const selected = dedupeConfig.columnIndices.includes(index.toString());
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => toggleColumnSelection(index, 'dedupe')}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => (e.key === 'Enter' ? toggleColumnSelection(index, 'dedupe') : null)}
                                                    className={`p-2 border rounded cursor-pointer text-sm transition-colors ${
                                                        selected ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {col.header ?? `Column ${index + 1}`}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-gray-500">No columns available</div>
                                    )}
                                </div>

                                {dedupeConfig.columnIndices.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {dedupeConfig.columnIndices.map((idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {columns[parseInt(idx, 10)]?.header ?? `Column ${idx}`}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Keep Which Record?</Label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={dedupeConfig.keepFirst}
                                            onChange={() => setDedupeConfig({ ...dedupeConfig, keepFirst: true })}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">First occurrence</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!dedupeConfig.keepFirst}
                                            onChange={() => setDedupeConfig({ ...dedupeConfig, keepFirst: false })}
                                            className="text-blue-600"
                                        />
                                        <span className="text-sm">Last occurrence</span>
                                    </label>
                                </div>
                            </div>

                            <Button onClick={handleDeduplicate} className="w-full">
                                Remove Duplicates
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    );
};

export default TransformationToolbar;