import React from 'react';
import { DOMTreeNode } from '../types';

interface TreeNodeProps {
    node: DOMTreeNode;
    depth: number;
    selectedNodeId: string | null;
    onSelect: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, selectedNodeId, onSelect }) => {
    const isSelected = selectedNodeId === node.id;
    
    // Icon Logic
    let icon = 'code';
    const tag = node.tagName;
    if(tag === 'p') icon = 'notes';
    else if(tag.startsWith('h')) icon = 'title';
    else if(tag === 'img') icon = 'image';
    else if(tag === 'a') icon = 'link';
    else if(tag === 'div' || tag === 'section') icon = 'web_asset';
    else if(tag === 'ul' || tag === 'ol') icon = 'format_list_bulleted';
    else if(tag === 'li') icon = 'remove';
    else if(tag === 'blockquote') icon = 'format_quote';
    
    // Text Node Rendering
    if (node.isTextNode) {
        const txt = node.textContent || '';
        // Only show text nodes that have meaningful content
        if(!txt.trim()) return null;

        const displayTxt = txt.length > 25 ? txt.substring(0, 25) + '...' : txt;
        
        return (
            <div className={`tree-line pl-4 py-1 flex items-center cursor-pointer hover:bg-gray-200 group ${isSelected ? 'bg-ink' : ''}`}
                 style={{ paddingLeft: `${(depth * 12) + 22}px` }}
                 onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
            >
                 <span className={`material-symbols-outlined text-[10px] mr-1 ${isSelected ? 'text-white' : 'text-ink-light'}`}>text_fields</span>
                 <span className={`text-[10px] font-serif truncate opacity-80 group-hover:opacity-100 max-w-[180px] ${isSelected ? 'text-white' : 'text-ink'}`}>"{displayTxt}"</span>
            </div>
        );
    }

    // Element Node Rendering
    const classSummary = node.classList.length > 0 ? `.${node.classList[0]}` : '';

    return (
        <div>
            <div 
                className={`tree-line py-0.5 flex items-center cursor-pointer hover:bg-gray-200 transition-colors border-l-2 border-transparent hover:border-ink pr-2 ${isSelected ? 'bg-ink border-ink' : ''}`}
                style={{ paddingLeft: `${depth * 12}px` }}
                onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
            >
                <span className={`material-symbols-outlined text-[10px] mr-1 opacity-50 ${isSelected ? 'text-white' : 'text-ink'}`}>{icon}</span>
                <span className={`text-[10px] font-bold font-mono mr-1 ${isSelected ? 'text-white' : 'text-ink'}`}>{tag}</span>
                <span className={`text-[9px] font-mono truncate ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>{classSummary}</span>
            </div>
            
            {node.children.map((child, idx) => (
                <TreeNode 
                    key={`${child.id}-${idx}`}
                    node={child}
                    depth={depth + 1}
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};

interface TreeSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    treeRoot: DOMTreeNode | null;
    selectedNodeId: string | null;
    onNodeSelect: (id: string) => void;
}

const TreeSidebar: React.FC<TreeSidebarProps> = ({ isOpen, onClose, treeRoot, selectedNodeId, onNodeSelect }) => {
    return (
        <aside 
            className={`w-80 bg-paper-dark border-r border-ink flex flex-col absolute lg:relative z-20 h-full transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            id="tree-sidebar"
        >
            <div className="h-10 border-b border-ink flex items-center justify-between px-3 bg-paper select-none shrink-0">
                <h2 className="text-[10px] font-bold uppercase tracking-widest flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">account_tree</span> Document Map
                </h2>
                <button onClick={onClose} className="lg:hidden">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                {treeRoot ? (
                    <TreeNode 
                        node={treeRoot} 
                        depth={0} 
                        selectedNodeId={selectedNodeId} 
                        onSelect={onNodeSelect} 
                    />
                ) : (
                    <div className="text-gray-400 italic text-center mt-10 text-[10px]">No Document Loaded</div>
                )}
            </div>
            
            <div className="h-8 border-t border-ink bg-paper flex items-center px-3 justify-between text-[10px] uppercase font-bold text-ink-light shrink-0">
                 <span>Structure View</span>
                 <span>ReadOnly</span>
            </div>
        </aside>
    );
};

export default TreeSidebar;