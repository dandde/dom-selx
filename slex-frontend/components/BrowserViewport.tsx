import React, { useRef, useEffect } from 'react';
import { ATTR_ID } from '../types';

interface BrowserViewportProps {
    htmlContent: string;
    selectedNodeId: string | null;
    onElementClick: (el: HTMLElement) => void;
    onDomParsed: (root: HTMLElement) => void;
    highlightedElements: HTMLElement[];
}

const BrowserViewport: React.FC<BrowserViewportProps> = ({
    htmlContent,
    selectedNodeId,
    onElementClick,
    onDomParsed,
    highlightedElements
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Initial Load & Parsing
    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();

                const style = doc.createElement('style');
                style.textContent = `
                    .dom-reader-highlight-selected {
                        outline: 0px solid #111111 !important;
                        background-color: rgba(142, 142, 142, 0.8) !important;
                        color: #fff !important;
                        position: relative;
                        cursor: pointer;
                        z-index: 10000;
                        filter: blur(0.5px);
                    }
                    .dom-reader-highlight-query {
                        background-color: #111111 !important;
                        color: #fff !important;
                        outline: 1px dashed #555;
                    }
                    body { cursor: default; }
                    *:hover { box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2); }
                `;
                doc.head.appendChild(style);

                if (doc.body) {
                    doc.body.id = "browser-view-root";
                    onDomParsed(doc.body);

                    const handleClick = (e: MouseEvent) => {
                        const target = e.target as HTMLElement;
                        if (target && target !== doc.body) {
                            e.stopPropagation();
                            e.preventDefault();
                            onElementClick(target);
                        }
                    };
                    doc.body.addEventListener('click', handleClick);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [htmlContent]);

    // Handle Selection Visuals
    useEffect(() => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return;

        const prevSelected = doc.querySelectorAll('.dom-reader-highlight-selected');
        prevSelected.forEach(el => el.classList.remove('dom-reader-highlight-selected'));

        if (selectedNodeId) {
            const el = doc.querySelector(`[${ATTR_ID}="${selectedNodeId}"]`);
            if (el) {
                el.classList.add('dom-reader-highlight-selected');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [selectedNodeId]);

    // Handle Query Highlights
    useEffect(() => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return;

        const prevHighlights = doc.querySelectorAll('.dom-reader-highlight-query');
        prevHighlights.forEach(el => el.classList.remove('dom-reader-highlight-query'));

        highlightedElements.forEach(el => {
            if (el.ownerDocument === doc) {
                el.classList.add('dom-reader-highlight-query');
            }
        });
    }, [highlightedElements]);

    return (
        <div className="flex-1 flex flex-col relative min-w-0 bg-[#e5e5e5]">
            {/* Browser Toolbar */}
            <div className="bg-paper border-b border-ink h-8 flex items-center px-4 justify-between select-none shrink-0">
                <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 border border-ink bg-white hover:bg-ink transition-colors"></div>
                    <div className="w-2.5 h-2.5 border border-ink bg-white hover:bg-ink transition-colors"></div>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest flex items-center">
                    <span className="material-symbols-outlined text-[14px] mr-1">public</span>
                    Viewport
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono text-ink-light border border-ink px-1 bg-white">100%</span>
                </div>
            </div>

            {/* Iframe Wrapper with Pattern */}
            <div className="flex-1 w-full h-full relative iframe-bg-pattern">
                <iframe
                    ref={iframeRef}
                    title="Simulated Browser View"
                    className="w-full h-full border-none bg-white block shadow-lg"
                    sandbox="allow-same-origin allow-scripts"
                />
            </div>
        </div>
    );
};

export default BrowserViewport;