import React, { useState, useEffect } from 'react';

interface HeaderProps {
    url: string;
    nodeCount: number;
    onUrlChange: (url: string) => void;
    onLoad: (url: string) => void;
    onPasteOpen: () => void;
    onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ url, nodeCount, onUrlChange, onLoad, onPasteOpen, onSidebarToggle }) => {
    const [inputValue, setInputValue] = useState(url);

    useEffect(() => {
        setInputValue(url);
    }, [url]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onLoad(inputValue);
        }
    };

    return (
        <header className="h-14 bg-paper border-b border-ink flex items-center px-4 shrink-0 z-30 select-none">
            <button 
                className="mr-4 lg:hidden p-1 border border-transparent hover:border-ink transition-all"
                onClick={onSidebarToggle}
            >
                <span className="material-symbols-outlined text-ink">menu</span>
            </button>
            
            <div className="flex items-center mr-6 border-r border-ink pr-6 h-full">
                <span className="material-symbols-outlined mr-2">travel_explore</span>
                <span className="font-bold tracking-tight">DOM_BROWSER</span>
            </div>

            {/* URL Input */}
            <div className="flex-1 flex items-center max-w-4xl group">
                <div className="flex-1 border border-ink flex items-center bg-white h-9 shadow-sm group-focus-within:shadow-hard transition-all">
                    <span className="px-3 bg-paper-dark border-r border-ink text-xs font-bold text-ink-light h-full flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">lock</span> HTTPS
                    </span>
                    <input 
                        className="w-full bg-transparent border-none text-ink px-3 py-1 font-mono text-xs focus:outline-none placeholder-gray-400" 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter URL (e.g., https://example.com)..."
                    />
                </div>
                <button 
                    onClick={() => onLoad(inputValue)}
                    className="ml-3 border border-ink bg-ink text-white px-5 h-9 uppercase text-xs font-bold hover:bg-white hover:text-ink transition-all flex items-center shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                    <span className="material-symbols-outlined text-[16px] mr-1">refresh</span> Load
                </button>
                <button
                    onClick={onPasteOpen}
                    className="ml-2 border border-ink bg-paper hover:bg-ink hover:text-white px-3 h-9 flex items-center shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    title="Paste HTML"
                >
                    <span className="material-symbols-outlined text-[18px]">code</span>
                </button>
            </div>

            {/* Status Indicator */}
            <div className="ml-auto hidden md:flex items-center text-[10px] font-mono space-x-4 text-ink-light">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>NODES: {nodeCount}</span>
                <span>SANDBOX: ACTIVE</span>
            </div>
        </header>
    );
};

export default Header;