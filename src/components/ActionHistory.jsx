import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
    RotateCcw,
    RotateCw,
    History,
    Upload,
    Split,
    Merge,
    MapPin,
    Copy,
    FileCheck,
} from 'lucide-react';

const ActionHistory = ({ history = [], onUndo = () => {}, onRedo = () => {}, canUndo = false, canRedo = false }) => {
    const normalize = (s = '') => String(s).toLowerCase();

    const getActionIcon = (action = '') => {
        const a = normalize(action);
        if (a.includes('upload')) return Upload;
        if (a.includes('split')) return Split;
        if (a.includes('merge') || a.includes('merged')) return Merge;
        if (a.includes('map') || a.includes('mapped')) return MapPin;
        if (a.includes('duplicate') || a.includes('dedupe') || a.includes('dedupe')) return Copy;
        return FileCheck;
    };

    const getActionColor = (action = '') => {
        const a = normalize(action);
        if (a.includes('upload')) return 'bg-blue-100 text-blue-800';
        if (a.includes('split')) return 'bg-green-100 text-green-800';
        if (a.includes('merge') || a.includes('merged')) return 'bg-purple-100 text-purple-800';
        if (a.includes('map') || a.includes('mapped')) return 'bg-orange-100 text-orange-800';
        if (a.includes('duplicate') || a.includes('dedupe')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <Card className="p-4 h-fit sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
                <History className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Action History</h3>
            </div>

            {/* Undo/Redo Controls */}
            <div className="flex space-x-2 mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex-1 flex items-center justify-center space-x-2"
                    aria-disabled={!canUndo}
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Undo</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="flex-1 flex items-center justify-center space-x-2"
                    aria-disabled={!canRedo}
                >
                    <RotateCw className="w-4 h-4" />
                    <span>Redo</span>
                </Button>
            </div>

            <Separator className="mb-4" />

            {/* History List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {(!history || history.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                        <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No actions yet</p>
                        <p className="text-xs text-gray-400">Upload a file to get started</p>
                    </div>
                ) : (
                    history.map((item, index) => {
                        const Icon = getActionIcon(item.action);
                        const colorClass = getActionColor(item.action);
                        const isLatest = index === history.length - 1;
                        const rowsAffected = Array.isArray(item.data) ? item.data.length : (item.data && item.data.length ? item.data.length : null);

                        return (
                            <div
                                key={index}
                                className={`history-item p-3 rounded-lg border transition-all ${
                                    isLatest
                                        ? 'border-blue-200 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <Badge variant={isLatest ? 'default' : 'secondary'} className="text-xs">
                                                #{index + 1}
                                            </Badge>
                                            <span className="text-xs text-gray-500">{item.timestamp ?? ''}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 break-words">
                                            {item.action}
                                        </p>
                                        {rowsAffected !== null && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {rowsAffected} rows
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Quick Stats */}
            {history && history.length > 0 && (
                <>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Actions:</span>
                            <Badge variant="outline">{history.length}</Badge>
                        </div>
                        {history[history.length - 1]?.data && Array.isArray(history[history.length - 1].data) && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Rows:</span>
                                <Badge variant="outline">{history[history.length - 1].data.length}</Badge>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Card>
    );
};

export default ActionHistory;
