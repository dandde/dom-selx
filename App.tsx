import React, { useState, useCallback, useRef } from 'react';
import { SAMPLE_PAGES } from './services/mockData';
import { buildVirtualTree, getCSSPath, getXPath, executeQuery } from './services/domService';
import { DOMTreeNode, InspectorState, QueryMode, ATTR_ID } from './types';

import Header from './components/Header';
import TreeSidebar from './components/TreeSidebar';
import BrowserViewport from './components/BrowserViewport';
import Inspector from './components/Inspector';
import PasteModal from './components/PasteModal';

const DEFAULT_URL = 'https://wiki.local/typography-history';

// Helper to sanitize and prep HTML for the simulator
const prepareFetchedHtml = (rawHtml: string, baseUrl: string) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        
        if (!doc.querySelector('base')) {
            const base = doc.createElement('base');
            base.href = baseUrl;
            doc.head.insertBefore(base, doc.head.firstChild);
        }

        const scripts = doc.querySelectorAll('script, iframe, object, embed');
        scripts.forEach(s => s.remove());

        const links = doc.querySelectorAll('a');
        links.forEach(a => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });

        return doc.documentElement.outerHTML;
    } catch (e) {
        console.error("Error parsing fetched HTML", e);
        return rawHtml;
    }
};

function App() {
    const [url, setUrl] = useState(DEFAULT_URL);
    const [htmlContent, setHtmlContent] = useState<string>(SAMPLE_PAGES[DEFAULT_URL]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pasteModalOpen, setPasteModalOpen] = useState(false);
    
    const iframeRootRef = useRef<HTMLElement | null>(null);
    
    const [treeRoot, setTreeRoot] = useState<DOMTreeNode | null>(null);
    const [nodeCount, setNodeCount] = useState(0);
    const [inspectorState, setInspectorState] = useState<InspectorState>({
        selectedNodeId: null,
        selectedElement: null,
        cssPath: '',
        xPath: ''
    });
    
    const [queryResults, setQueryResults] = useState<HTMLElement[]>([]);

    const handleLoadUrl = useCallback(async (newUrl: string) => {
        setIsLoading(true);
        setUrl(newUrl);
        setInspectorState({ selectedNodeId: null, selectedElement: null, cssPath: '', xPath: '' });
        setQueryResults([]);

        if (SAMPLE_PAGES[newUrl]) {
            setTimeout(() => {
                setHtmlContent(SAMPLE_PAGES[newUrl]);
                setIsLoading(false);
            }, 600);
            return;
        }

        if (newUrl.startsWith('local://')) {
             setIsLoading(false);
             return;
        }

        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(newUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const rawText = await response.text();
            if (!rawText || rawText.length < 50) throw new Error("Received empty or invalid response");

            const processedHtml = prepareFetchedHtml(rawText, newUrl);
            setHtmlContent(processedHtml);

        } catch (err) {
            console.error("Fetch error:", err);
            const errorHtml = `
                <div style="font-family: monospace; padding: 2rem; text-align: center; color: #111;">
                    <h1 style="font-size: 24px; margin-bottom: 1rem; text-transform: uppercase; border-bottom: 1px solid #111; display: inline-block;">Load Error</h1>
                    <div style="margin-top: 2rem; padding: 1rem; border: 1px dashed #111;">
                        ${err instanceof Error ? err.message : 'Unknown Network Error'}
                    </div>
                </div>
            `;
            setHtmlContent(errorHtml);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCustomHtmlLoad = useCallback((html: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setHtmlContent(html);
            setUrl('local://custom-source');
            setIsLoading(false);
        }, 500);
    }, []);

    const handleDomParsed = useCallback((rootContainer: HTMLElement) => {
        iframeRootRef.current = rootContainer;
        const tree = buildVirtualTree(rootContainer);
        setTreeRoot(tree);

        let count = 0;
        const countNodes = (node: DOMTreeNode) => {
            count++;
            if (node.children) node.children.forEach(countNodes);
        };
        if (tree) countNodes(tree);
        setNodeCount(count);
        
        setInspectorState({ selectedNodeId: null, selectedElement: null, cssPath: '', xPath: '' });
        setQueryResults([]);
    }, []);

    const handleElementClick = useCallback((el: HTMLElement) => {
        const id = el.getAttribute(ATTR_ID);
        const rootContainer = iframeRootRef.current;
        setInspectorState({
            selectedNodeId: id,
            selectedElement: el,
            cssPath: rootContainer ? getCSSPath(el, rootContainer.id) : '',
            xPath: rootContainer ? getXPath(el, rootContainer.id) : ''
        });
    }, []);

    const handleNodeSelect = useCallback((id: string) => {
        const rootContainer = iframeRootRef.current;
        if (!rootContainer) return;
        const el = rootContainer.querySelector(`[${ATTR_ID}="${id}"]`) as HTMLElement;
        if (el) {
            setInspectorState({
                selectedNodeId: id,
                selectedElement: el,
                cssPath: getCSSPath(el, rootContainer.id),
                xPath: getXPath(el, rootContainer.id)
            });
        } else {
            setInspectorState(prev => ({ ...prev, selectedNodeId: id }));
        }
    }, []);

    const handleQueryExtract = useCallback((mode: QueryMode, query: string) => {
        const rootContainer = iframeRootRef.current;
        if (!rootContainer) return;
        const results = executeQuery(mode, query, rootContainer);
        setQueryResults(results);
    }, []);

    return (
        <div className="bg-paper text-ink h-screen flex flex-col overflow-hidden text-sm selection:bg-ink selection:text-paper">
            <Header 
                url={url} 
                nodeCount={nodeCount}
                onUrlChange={setUrl}
                onLoad={handleLoadUrl}
                onPasteOpen={() => setPasteModalOpen(true)}
                onSidebarToggle={() => setSidebarOpen(true)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                <TreeSidebar 
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    treeRoot={treeRoot}
                    selectedNodeId={inspectorState.selectedNodeId}
                    onNodeSelect={handleNodeSelect}
                />

                <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
                    <BrowserViewport 
                        htmlContent={htmlContent}
                        selectedNodeId={inspectorState.selectedNodeId}
                        onElementClick={handleElementClick}
                        onDomParsed={handleDomParsed}
                        highlightedElements={queryResults}
                    />

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-paper/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin mb-4"></div>
                            <div className="text-xs font-mono font-bold animate-pulse">ESTABLISHING CONNECTION...</div>
                        </div>
                    )}
                </main>

                <Inspector 
                    inspectorState={inspectorState}
                    onExtract={handleQueryExtract}
                    queryResults={queryResults}
                    onResultClick={handleElementClick}
                />
            </div>

            <PasteModal 
                isOpen={pasteModalOpen} 
                onClose={() => setPasteModalOpen(false)} 
                onLoad={handleCustomHtmlLoad} 
            />
        </div>
    );
}

export default App;