// User types
export interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

// Document types
export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface Document {
    _id: string;
    originalName: string;
    filename: string;
    mimeType: string;
    size: number;
    status: DocumentStatus;
    uploadedAt: string;
    processedAt?: string;
    errorMessage?: string;
}

// Search/Query types
export interface Reference {
    documentId: string;
    documentName: string;
    excerpt: string;
    relevanceScore?: number;
}

export interface Query {
    _id: string;
    userId: string;
    question: string;
    answer: string;
    references: Reference[];
    createdAt: string;
}

export interface ChatMessage {
    content: string;
    isUser: boolean;
    references?: Reference[];
    timestamp: Date;
    type?: 'text' | 'file';
    attachedFile?: {
        id: string;
        name: string;
        size: number;
    };
}

// API Response types
export interface AuthResponse {
    token: string;
    _id: string;
    name: string;
    email: string;
}

export interface PaginatedDocumentResponse {
    documents: Document[];
    totalDocuments: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedQueryResponse {
    queries: Query[];
    totalQueries: number;
    totalPages: number;
    currentPage: number;
}

export interface SearchResponse {
    answer: string;
    references: Reference[];
}

// Auth Context types
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string) => Promise<User>;
    logout: () => void;
    isAuthenticated: boolean;
}
