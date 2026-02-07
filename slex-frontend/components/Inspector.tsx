import React, { useState } from 'react';
import { InspectorState, QueryMode } from '../types';

interface InspectorProps {
    inspectorState: InspectorState;
    onExtract: (mode: QueryMode, query: string) => void;
    queryResults: HTMLElement[];
    onResultClick: (el: HTMLElement) => void;
}

const Inspector: React.FC<InspectorProps> = ({ inspectorState, onExtract, queryResults, onResultClick }) => {
    const { selectedElement, cssPath, xPath } = inspectorState;
    const [queryMode, setQueryMode] = useState<QueryMode>(QueryMode.CSS);
    const [queryInput, setQueryInput] = useState('');

    const attributes: Attr[] = selectedElement ? Array.from(selectedElement.attributes) : [];
    const filteredAttrs = attributes.filter(a => !a.name.startsWith('data-dom'));
    const attrString = filteredAttrs.map(a => `${a.name}="${a.value}"`).join(' ');
    
    let contentPreview = selectedElement ? selectedElement.innerText.trim() : '';
    if (contentPreview.length > 200) contentPreview = contentPreview.substring(0, 200) + '...';

    const copyToClipboard = (text: string) => {
        if (text) navigator.clipboard.writeText(text);
    };

    return (
        <aside className="w-80 bg-paper border-l border-ink flex flex-col shrink-0 h-full shadow-lg z-10">
            
            {/* Top Pane: Node Details */}
            <div className="flex-1 flex flex-col border-b border-ink min-h-[50%] max-h-[60%] overflow-hidden">
                <div className="h-10 border-b border-ink bg-paper-dark flex items-center px-3 select-none shrink-0">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center">
                        <span className="material-symbols-outlined text-sm mr-1">data_object</span> Inspector
                    </h2>
                </div>
                
                <div className="p-4 overflow-y-auto space-y-6">
                    {!selectedElement ? (
                         <div className="text-ink-light text-xs text-center pt-8 font-mono italic">Select an element in the viewport or tree to inspect properties.</div>
                    ) : (
                        <>
                            {/* Target Node Header */}
                            <div className="mb-4 pb-2 border-b border-ink border-dashed">
                                <span className="text-[9px] uppercase font-bold text-gray-400">Target</span>
                                <div className="text-3xl font-mono font-bold text-ink mt-1">&lt;{selectedElement.tagName.toLowerCase()}&gt;</div>
                            </div>

                            <div className="space-y-5">
                                {/* Text Content */}
                                <div className="relative">
                                    <span className="absolute -top-2 left-2 bg-paper px-1 text-[9px] font-bold text-gray-400 uppercase z-10">Text Content</span>
                                    <div className="bg-white border border-ink p-3 text-xs font-serif italic text-gray-800 max-h-32 overflow-y-auto leading-relaxed min-h-[3rem]">
                                        {contentPreview || <span className="text-gray-300 not-italic">No direct text content</span>}
                                    </div>
                                </div>

                                {/* CSS Selector */}
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-bold uppercase text-ink">CSS Selector</span>
                                        <button 
                                            onClick={() => copyToClipboard(cssPath)}
                                            className="text-[10px] uppercase font-bold hover:text-ink-light transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div 
                                        className="bg-paper-dark border border-ink p-2 text-[10px] font-mono break-all min-h-[2.5em] flex items-center select-all cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => copyToClipboard(cssPath)}
                                        title={cssPath}
                                    >
                                        {cssPath || <span className="text-gray-400 italic">No selector available</span>}
                                    </div>
                                </div>

                                {/* XPath */}
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-bold uppercase text-ink">XPath</span>
                                        <button 
                                            onClick={() => copyToClipboard(xPath)}
                                            className="text-[10px] uppercase font-bold hover:text-ink-light transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div 
                                        className="bg-paper-dark border border-ink p-2 text-[10px] font-mono break-all min-h-[2.5em] flex items-center select-all cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => copyToClipboard(xPath)}
                                        title={xPath}
                                    >
                                        {xPath || <span className="text-gray-400 italic">No XPath available</span>}
                                    </div>
                                </div>

                                {/* Attributes */}
                                {filteredAttrs.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold uppercase text-ink">Attributes</span>
                                            <button 
                                                onClick={() => copyToClipboard(attrString)}
                                                className="text-[10px] uppercase font-bold hover:text-ink-light transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <div 
                                            className="bg-paper-dark border border-ink p-2 text-[10px] font-mono break-all min-h-[2.5em] flex items-center select-all cursor-pointer hover:bg-gray-200 transition-colors"
                                            onClick={() => copyToClipboard(attrString)}
                                            title={attrString}
                                        >
                                            {attrString}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Pane: Query Engine */}
            <div className="flex-1 flex flex-col bg-paper overflow-hidden">
                <div className="h-10 border-b border-ink bg-paper-dark flex items-center px-3 justify-between select-none shrink-0">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center">
                        <span className="material-symbols-outlined text-sm mr-1">filter_list</span> Query Engine
                    </h2>
                    {queryResults.length > 0 && <span className="bg-ink text-white text-[9px] px-1 rounded">{queryResults.length}</span>}
                </div>
                
                <div className="p-4 space-y-4 shrink-0">
                    <div className="flex border border-ink p-0.5 gap-0.5 bg-paper-dark">
                        <button 
                            onClick={() => setQueryMode(QueryMode.CSS)}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase transition-all shadow-sm ${queryMode === QueryMode.CSS ? 'bg-ink text-white' : 'text-ink hover:bg-white'}`}
                        >
                            CSS
                        </button>
                        <button 
                            onClick={() => setQueryMode(QueryMode.XPATH)}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase transition-all shadow-sm ${queryMode === QueryMode.XPATH ? 'bg-ink text-white' : 'text-ink hover:bg-white'}`}
                        >
                            XPath
                        </button>
                    </div>

                    <div className="space-y-1 relative">
                        <input 
                            type="text" 
                            className="w-full bg-white border border-ink p-2 pr-8 text-xs font-mono focus:shadow-hard focus:outline-none transition-shadow placeholder-gray-400" 
                            placeholder={queryMode === QueryMode.CSS ? 'e.g. h1, .content p' : 'e.g. //div[@id="main"]'}
                            value={queryInput}
                            onChange={(e) => setQueryInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onExtract(queryMode, queryInput)}
                        />
                        <span className="absolute right-2 top-2 text-ink-light material-symbols-outlined text-sm pointer-events-none">search</span>
                    </div>

                    <button 
                        onClick={() => onExtract(queryMode, queryInput)}
                        className="w-full border border-ink py-2 uppercase text-xs font-bold hover:bg-ink hover:text-white transition-colors flex items-center justify-center shadow-sm active:translate-y-0.5"
                    >
                        Run Extraction
                    </button>
                </div>

                {/* Results List */}
                <div className="flex-1 border-t border-ink bg-[#f8f8f8] p-3 overflow-y-auto font-mono text-xs">
                    {queryResults.length === 0 ? (
                        <div className="text-center text-gray-400 italic mt-2 select-none text-[10px]">No matches.</div>
                    ) : (
                        <div className="space-y-2">
                            {queryResults.map((el, idx) => {
                                let txt = el.innerText.trim();
                                if(txt.length > 50) txt = txt.substring(0, 50) + '...';

                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => onResultClick(el)}
                                        className="bg-white border border-gray-300 p-2 hover:border-ink cursor-pointer transition-colors shadow-sm group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs font-mono text-ink group-hover:text-blue-700">&lt;{el.tagName.toLowerCase()}&gt;</span>
                                            <span className="text-[9px] bg-gray-200 px-1 rounded text-gray-600">#{idx + 1}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-600 truncate font-sans">
                                            {txt || <span className="italic text-gray-300">No content</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Inspector;