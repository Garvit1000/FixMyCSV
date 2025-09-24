

import React, { useState, useEffect } from 'react';
import {
    Database,
    FileText,
    Download,
    Upload,
    BarChart3,
    Settings,
    Zap,
    Shield,
    Code,
    ChevronRight,
    Search,
    Copy,
    ExternalLink,
    Menu,
    X
} from 'lucide-react';

import Docsimage from '../assets/docs1.png';
import Docsimage2 from '../assets/docs2.png';
import Docsimage3 from '../assets/docs3.png';
import Docsimage4 from '../assets/docs4.png';
import Docsimage5 from '../assets/docs5.png';


const DocsPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('introduction');

    // Define sections that actually exist in the document
    const sidebarItems = [
        {
            title: "Getting Started",
            items: [
                { name: "Introduction", href: "#introduction", id: "introduction" },
                { name: "Quick Start Guide", href: "#quick-start", id: "quick-start" }
            ]
        },
        {
            title: "Core Features",
            items: [
                { name: "Data Upload & Import", href: "#data-upload", id: "data-upload" },
                { name: "Data Transformations", href: "#data-transformations", id: "data-transformations" },
                { name: "Data Visualization", href: "#data-visualization", id: "data-visualization" },
                { name: "Export & Download", href: "#export-download", id: "export-download" }
            ]
        },
        {
            title: "System",
            items: [
                { name: "Performance & Security", href: "#performance-security", id: "performance-security" }
            ]
        }
    ];

    const allItems = sidebarItems.flatMap(section => 
        section.items.map(item => ({ ...item, section: section.title }))
    );

    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.section.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Intersection Observer for active section tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '-20% 0px -70% 0px'
            }
        );

        // Observe all sections
        const sections = document.querySelectorAll('section[id], h1[id]');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const handleSectionClick = (href, id) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
            setSidebarOpen(false);
        }
    };

    const SearchModal = () => {
        if (!searchOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                    <div className="flex items-center px-4 py-3 border-b">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 outline-none text-sm"
                            autoFocus
                        />
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="ml-3 p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        handleSectionClick(item.href, item.id);
                                        setSearchOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="font-medium text-sm text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.section}</div>
                                </button>
                            ))
                        ) : searchQuery ? (
                            <div className="px-4 py-6 text-center text-gray-500">
                                <div className="text-sm">No results found for "{searchQuery}"</div>
                            </div>
                        ) : (
                            <div className="px-4 py-3 text-xs text-gray-500">
                                Type to search documentation...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <SearchModal />
            
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <Database className="w-6 h-6 text-black" />
                                <a href="/" className="flex items-center space-x-2">
                                    <span className="text-lg font-semibold text-black">FixMyCSV</span>
                                </a>
                            </div>
                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="/docs" className="text-sm font-medium text-black">Docs</a>
                                <a href="https://github.com/Garvit1000/FixMyCSV" className="text-sm text-gray-600 hover:text-black transition-colors">GitHub</a>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="hidden lg:flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                <Search className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Search documentation...</span>
                                <div className="flex items-center space-x-1">
                                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">Ctrl</kbd>
                                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">K</kbd>
                                </div>
                            </button>

                            <button
                                onClick={() => setSearchOpen(true)}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-50"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden p-2 rounded-md hover:bg-gray-50"
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex">
                    {/* Sidebar */}
                    <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0 py-8 pr-8`}>
                        <nav className="space-y-8 sticky top-24">
                            {sidebarItems.map((section, index) => (
                                <div key={index}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h3>
                                    <ul className="space-y-2">
                                        {section.items.map((item, itemIndex) => (
                                            <li key={itemIndex}>
                                                <button
                                                    onClick={() => handleSectionClick(item.href, item.id)}
                                                    className={`text-sm transition-colors block py-1 w-full text-left hover:text-black ${
                                                        activeSection === item.id 
                                                            ? 'text-black font-medium border-l-2 border-black pl-3 -ml-3' 
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {item.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 py-8 px-8">
                        <div className="max-w-4xl">
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 id="introduction" className="text-4xl font-bold text-black mb-4">Introduction</h1>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Introduction Content */}
                            <div className="prose prose-gray max-w-none mb-12">
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                    FixMyCSV is a powerful, open-source tool for cleaning, transforming, and visualizing your data.
                                    Works with CSV, TSV, and JSON files with professional-grade features. Built for speed, accessibility, and ease of use.
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                                    <p className="text-sm text-blue-800 font-medium">
                                        This is not just another data tool. It's how you build your data transformation workflow.
                                    </p>
                                </div>

                                <p className="text-gray-700 mb-6">
                                    Most data cleaning tools follow a simple pattern: upload, transform, export. While this works for basic tasks,
                                    it becomes limiting when you need to split columns, merge data, remove duplicates, or visualize patterns
                                    in your dataset.
                                </p>

                                <p className="text-gray-700 mb-6">
                                    FixMyCSV eliminates these limitations by providing professional-grade transformation tools,
                                    real-time visualizations, and an intuitive interface that scales from simple CSV cleaning to complex
                                    data analysis workflows.
                                </p>

                                <p className="text-gray-700 mb-8">
                                    This is what FixMyCSV aims to solve. It is built around the following principles:
                                </p>

                                <ul className="space-y-4 mb-12">
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-black">Open Source:</strong> The entire codebase is open for modification and contribution.
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-black">Easy to Use:</strong> Every feature uses an intuitive interface, making complex operations simple.
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-black">Powerful Features:</strong> A comprehensive set of tools for data transformation and analysis.
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-black">Lightning Fast:</strong> Optimized performance for handling large datasets efficiently.
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-black">Secure by Design:</strong> All data processing happens locally in your browser. No data leaves your device.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Features Section */}
                            <section id="core-features" className="mb-16">
                                <h2 className="text-3xl font-bold text-black mb-8">Core Features</h2>

                                <div className="space-y-8">
                                    <div id="data-upload" className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Upload className="w-6 h-6 text-gray-700" />
                                            <h3 className="text-xl font-semibold text-black">Data Upload & Import</h3>
                                        </div>
                                        <p className="text-gray-700 mb-4">
                                            FixMyCSV provides seamless file upload capabilities. You have full control to import and process
                                            your data files with support for multiple formats. This means:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                                            <li>Support for CSV, TSV, and JSON file formats</li>
                                            <li>Drag-and-drop file upload interface</li>
                                            <li>Automatic format detection and parsing</li>
                                            <li>Real-time file validation and error handling</li>
                                        </ul>

                                        <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                                            <div className="text-center">
                                                <img
                                                    src={Docsimage}
                                                    alt="Data Upload Screenshot"
                                                    className="mx-auto max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div id="data-transformations" className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Settings className="w-6 h-6 text-gray-700" />
                                            <h3 className="text-xl font-semibold text-black">Data Transformations</h3>
                                        </div>
                                        <p className="text-gray-700 mb-4">
                                            Powerful transformation tools let you clean and reshape your data exactly how you need it:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                                            <li>Split columns by delimiters</li>
                                            <li>Merge multiple columns</li>
                                            <li>Map and replace values</li>
                                            <li>Remove duplicates with flexible options</li>
                                            <li>Undo/redo functionality for safe experimentation</li>
                                        </ul>

                                        <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                                            <div className="text-center">
                                                <img
                                                    src={Docsimage2}
                                                    alt="Data Transformation Screenshot"
                                                    className="mx-auto max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div id="data-visualization" className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <BarChart3 className="w-6 h-6 text-gray-700" />
                                            <h3 className="text-xl font-semibear text-black">Data Visualization</h3>
                                        </div>
                                        <p className="text-gray-700 mb-4">
                                            Interactive charts and visualizations help you understand your data patterns:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                                            <li>Automatic chart generation based on data types</li>
                                            <li>Distribution analysis for numerical data</li>
                                            <li>Frequency analysis for categorical data</li>
                                            <li>Interactive chart controls and customization</li>
                                        </ul>

                                        <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                                            <div className="text-center">
                                                <img
                                                    src={Docsimage3}
                                                    alt="Data visualization Screenshot"
                                                    className="mx-auto max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div id="export-download" className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Download className="w-6 h-6 text-gray-700" />
                                            <h3 className="text-xl font-semibold text-black">Export & Download</h3>
                                        </div>
                                        <p className="text-gray-700 mb-4">
                                            Export your cleaned and transformed data in your preferred format:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                                            <li>Export to CSV or JSON formats</li>
                                            <li>Preserve all transformations and column modifications</li>
                                            <li>Filename preservation and automatic naming</li>
                                            <li>One-click download with progress indicators</li>
                                        </ul>

                                        <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                                            <div className="text-center">
                                                <img
                                                    src={Docsimage4}
                                                    alt="Data export Screenshot"
                                                    className="mx-auto max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Getting Started Section */}
                            <section id="quick-start" className="mb-16">
                                <h2 className="text-3xl font-bold text-black mb-8">Getting Started</h2>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                                    <h3 className="text-lg font-semibold text-black mb-4">Quick Start Guide</h3>
                                    <ol className="space-y-3">
                                        <li className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center">1</span>
                                            <div>
                                                <strong className="text-black">Upload your data file</strong>
                                                <p className="text-sm text-gray-600">Drag and drop your CSV, TSV, or JSON file onto the upload area</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center">2</span>
                                            <div>
                                                <strong className="text-black">Preview and explore</strong>
                                                <p className="text-sm text-gray-600">Review your data in the interactive table and check the automatically generated statistics</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center">3</span>
                                            <div>
                                                <strong className="text-black">Apply transformations</strong>
                                                <p className="text-sm text-gray-600">Use the transformation toolbar to clean, split, merge, or deduplicate your data</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center">4</span>
                                            <div>
                                                <strong className="text-black">Visualize and analyze</strong>
                                                <p className="text-sm text-gray-600">Generate charts and visualizations to better understand your data patterns</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full text-xs font-bold flex items-center justify-center">5</span>
                                            <div>
                                                <strong className="text-black">Export your results</strong>
                                                <p className="text-sm text-gray-600">Download your cleaned data in CSV or JSON format</p>
                                            </div>
                                        </li>
                                    </ol>
                                </div>

                                <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                                    <div className="text-center">
                                        <img
                                            src={Docsimage5}
                                            alt="Data workflow Screenshot"
                                            className="mx-auto max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Performance & Security */}
                            <section id="performance-security" className="mb-16">
                                <h2 className="text-3xl font-bold text-black mb-8">Performance & Security</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Zap className="w-6 h-6 text-yellow-600" />
                                            <h3 className="text-lg font-semibold text-black">Lightning Fast</h3>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            Optimized for performance with efficient algorithms and memory management.
                                            Handles large datasets smoothly with responsive UI updates.
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Shield className="w-6 h-6 text-green-600" />
                                            <h3 className="text-lg font-semibold text-black">Privacy First</h3>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            All processing happens locally in your browser. No data is sent to external servers.
                                            Your sensitive information stays on your device.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>

                    {/* Table of Contents - Updated to match actual sections */}
                    <aside className="hidden xl:block w-64 flex-shrink-0 py-8 pl-8">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">On This Page</h3>
                            <nav>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => handleSectionClick('#introduction', 'introduction')}
                                            className={`text-sm transition-colors block py-1 w-full text-left hover:text-black ${
                                                activeSection === 'introduction' ? 'text-black font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            Introduction
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleSectionClick('#core-features', 'core-features')}
                                            className={`text-sm transition-colors block py-1 w-full text-left hover:text-black ${
                                                activeSection === 'core-features' ? 'text-black font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            Core Features
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleSectionClick('#quick-start', 'quick-start')}
                                            className={`text-sm transition-colors block py-1 w-full text-left hover:text-black ${
                                                activeSection === 'quick-start' ? 'text-black font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            Getting Started
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleSectionClick('#performance-security', 'performance-security')}
                                            className={`text-sm transition-colors block py-1 w-full text-left hover:text-black ${
                                                activeSection === 'performance-security' ? 'text-black font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            Performance & Security
                                        </button>
                                    </li>
                                </ul>
                            </nav>

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;