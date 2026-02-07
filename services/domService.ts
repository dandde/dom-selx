import { DOMTreeNode, ATTR_ID } from '../types';

let uuidCounter = 0;
const generateId = () => `node-${uuidCounter++}`;

/**
 * Traverses a real DOM Element and builds a lightweight tree structure for the sidebar.
 * It also assigns a unique ID to the real DOM element to link them.
 */
export const buildVirtualTree = (rootElement: HTMLElement): DOMTreeNode | null => {
    uuidCounter = 0; // Reset on new build
    return traverse(rootElement);
};

const traverse = (node: Node): DOMTreeNode | null => {
    // Handle Text Nodes
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (!text || text.length < 2) return null;
        
        return {
            id: `text-${generateId()}`,
            tagName: 'text',
            classList: [],
            children: [],
            textContent: text,
            isTextNode: true
        };
    }

    // Handle Elements
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const id = generateId();
        el.setAttribute(ATTR_ID, id);

        const children: DOMTreeNode[] = [];
        Array.from(node.childNodes).forEach(child => {
            const result = traverse(child);
            if (result) children.push(result);
        });

        return {
            id,
            tagName: el.tagName.toLowerCase(),
            classList: Array.from(el.classList),
            children,
            isTextNode: false,
            textContent: undefined // Only relevant for text nodes
        };
    }

    return null;
};

/**
 * Generates a specific CSS Selector path for an element.
 */
export const getCSSPath = (el: HTMLElement, rootContainerId: string): string => {
    // FIX: Do not use `instanceof Element` here because 'el' comes from an Iframe.
    // Objects from an iframe are not instances of the parent window's Element class.
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
    
    // Explicitly handle root container / body
    if (el.id === rootContainerId || el.tagName === 'BODY') {
        return 'body';
    }

    const path: string[] = [];
    let current: HTMLElement | null = el;

    // We traverse up until we hit the root container (iframe body) or Document
    while (
        current && 
        current.nodeType === Node.ELEMENT_NODE && 
        current.id !== rootContainerId && 
        current.tagName !== 'HTML' 
    ) {
        let selector = current.nodeName.toLowerCase();
        
        // Use ID if available, but ensure it's not one of our internal 'node-' IDs 
        // if they somehow leaked into the id attribute (though we use ATTR_ID usually)
        if (current.id && !current.id.startsWith('node-')) { 
            selector += '#' + current.id;
            path.unshift(selector);
            break; 
        } else {
            let sib = current;
            let nth = 1;
            while ((sib = sib.previousElementSibling as HTMLElement)) {
                if (sib.nodeName.toLowerCase() === selector) nth++;
            }
            if (nth !== 1) selector += `:nth-of-type(${nth})`;
        }
        path.unshift(selector);
        current = current.parentElement;
    }
    return path.join(" > ");
};

/**
 * Generates an XPath for an element.
 */
export const getXPath = (el: HTMLElement, rootContainerId: string): string => {
    if (el.id && el.id !== rootContainerId && !el.id.startsWith('node-')) {
        return `//*[@id="${el.id}"]`;
    }
    
    // Stop at the container root
    if (el.id === rootContainerId || el.tagName === 'BODY' || el.tagName === 'HTML') {
        return '/html/body'; // Simplified base
    }
    if(!el.parentNode) return '';

    let ix = 0;
    const siblings = el.parentNode.childNodes;
    
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === el) {
            const parentPath = getXPath(el.parentNode as HTMLElement, rootContainerId);
            const tagName = el.tagName.toLowerCase();
            return parentPath + '/' + tagName + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && (sibling as Element).tagName === el.tagName) {
            ix++;
        }
    }
    return '';
};

/**
 * Executes a CSS or XPath query within a container.
 */
export const executeQuery = (mode: 'CSS' | 'XPATH', query: string, container: HTMLElement): HTMLElement[] => {
    if (!query || !container) return [];

    try {
        if (mode === 'CSS') {
            return Array.from(container.querySelectorAll(query)) as HTMLElement[];
        } else {
            // Safe XPath: ensure it runs inside the container
            // If the query is absolute like /html/body/div, we need to respect the iframe document
            let safeQuery = query;
            if (!query.startsWith('/') && !query.startsWith('(')) {
                safeQuery = './/' + query;
            }
            
            // Use ownerDocument to evaluate XPath within the iframe's context
            const doc = container.ownerDocument || document;
            
            const res = doc.evaluate(
                safeQuery, 
                container, // Context node
                null, 
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
                null
            );
            const found: HTMLElement[] = [];
            for (let i = 0; i < res.snapshotLength; i++) {
                const item = res.snapshotItem(i);
                if (item && item.nodeType === Node.ELEMENT_NODE) {
                    found.push(item as HTMLElement);
                }
            }
            return found;
        }
    } catch (e) {
        console.error("Query execution error", e);
        return [];
    }
};