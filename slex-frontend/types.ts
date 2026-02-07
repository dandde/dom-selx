export interface DOMTreeNode {
    id: string;
    tagName: string;
    classList: string[];
    children: DOMTreeNode[];
    textContent?: string;
    isTextNode: boolean;
}

export interface InspectorState {
    selectedNodeId: string | null;
    selectedElement: HTMLElement | null;
    cssPath: string;
    xPath: string;
}

export interface QueryResult {
    element: HTMLElement;
    tagName: string;
    preview: string;
}

export enum QueryMode {
    CSS = 'CSS',
    XPATH = 'XPATH'
}

export const ATTR_ID = 'data-dom-reader-id';
