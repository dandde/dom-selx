import React, { useState } from 'react';

interface PasteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (html: string) => void;
}

const PasteModal: React.FC<PasteModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [html, setHtml] = useState('');

    if (!isOpen) return null;

    const handleLoad = () => {
        if (html.trim()) {
            onLoad(html);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-paper/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-paper border-2 border-ink w-full max-w-3xl shadow-hard flex flex-col">
                <div className="flex justify-between items-center p-3 border-b border-ink bg-paper-dark select-none">
                    <h3 className="font-bold uppercase tracking-widest text-xs flex items-center">
                        <span className="material-symbols-outlined text-sm mr-2">code</span> Inject Document
                    </h3>
                    <button 
                        onClick={onClose}
                        className="hover:bg-ink hover:text-white p-1 transition-colors border border-transparent hover:border-ink"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
                <div className="p-4 bg-white">
                    <textarea 
                        className="w-full h-80 border border-ink p-4 font-mono text-xs bg-paper-dark focus:outline-none focus:bg-white focus:shadow-sm resize-none leading-relaxed" 
                        placeholder="<!-- Paste your HTML document structure here -->"
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                    ></textarea>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={handleLoad}
                            className="border border-ink px-6 py-2 uppercase text-xs font-bold bg-white hover:bg-ink hover:text-white transition-colors shadow-hard active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
                        >
                            Load Document
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasteModal;