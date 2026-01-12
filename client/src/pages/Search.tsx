import React, { useState, useRef, useEffect } from 'react';
import { searchAPI, documentsAPI } from '../api';
import ChatMessage from '../components/ChatMessage';
import { ArrowUp, FileText, Loader2, Paperclip, Sparkles, X } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types';
import { Avatar } from '../components/ui';

// Types
interface Suggestion {
    title: string;
    desc: string;
}

// Constants
const ALLOWED_FILE_TYPES = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SUGGESTIONS: Suggestion[] = [
    { title: 'Summarize this document', desc: 'Get a quick overview' },
    { title: 'What are the key points?', desc: 'Extract main takeaways' },
    { title: 'Explain the main topics', desc: 'Understand the content' },
    { title: 'List important details', desc: 'Extract key information' },
];

const Search = () => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sessionDocumentIds, setSessionDocumentIds] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasDocuments = sessionDocumentIds.length > 0;

    // Effects
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    // File validation
    const validateFile = (file: File): boolean => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            alert('Please upload a PDF, TXT, MD, or CSV file');
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert('File size must be less than 10MB');
            return false;
        }
        return true;
    };

    // Handlers
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            await handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        setSelectedFile(file);

        try {
            const response = await documentsAPI.upload(file);
            const uploadedDoc = response.data;

            setSessionDocumentIds((prev) => [...prev, uploadedDoc._id]);

            const uploadMessage: ChatMessageType = {
                content: `Uploaded: ${file.name}`,
                isUser: true,
                timestamp: new Date(),
                type: 'file',
                attachedFile: {
                    id: uploadedDoc._id,
                    name: file.name,
                    size: file.size,
                },
            };
            setMessages((prev) => [...prev, uploadMessage]);

            // Add system confirmation message
            setTimeout(() => {
                const systemMessage: ChatMessageType = {
                    content: `I've received "${file.name}". You can now ask me questions about this document.`,
                    isUser: false,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, systemMessage]);
            }, 500);

            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.response?.data?.message || 'Failed to upload document. Please try again.');
            setSelectedFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (id: string) => {
        try {
            await documentsAPI.delete(id);
            setSessionDocumentIds((prev) => prev.filter((docId) => docId !== id));
            setMessages((prev) => prev.filter((m) => m.attachedFile?.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete document');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        // Check for documents
        if (!hasDocuments) {
            const noDocMessage: ChatMessageType = {
                content:
                    "Please upload a document first. I can only answer questions about documents you've uploaded in this conversation.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [
                ...prev,
                { content: input, isUser: true, timestamp: new Date() },
                noDocMessage,
            ]);
            setInput('');
            return;
        }

        const userMessage: ChatMessageType = {
            content: input,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        try {
            const response = await searchAPI.ask(input, sessionDocumentIds);
            const aiMessage: ChatMessageType = {
                content: response.data.answer,
                isUser: false,
                references: response.data.references,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            console.error('Search error:', error);
            let errorMessage = error.response?.data?.message || 'Sorry, I encountered an error.';
            if (error.response?.status === 503) {
                errorMessage = 'The AI service is currently busy. Please try again in a moment.';
            }

            const errorChatMessage: ChatMessageType = {
                content: errorMessage,
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorChatMessage]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] bg-[#212121]">
            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full px-4">
                    {messages.length === 0 ? (
                        <WelcomeScreen suggestions={SUGGESTIONS} />
                    ) : (
                        <ChatArea
                            messages={messages}
                            loading={loading}
                            onDeleteDocument={handleDeleteDocument}
                            messagesEndRef={messagesEndRef}
                        />
                    )}
                </div>
            </div>

            {/* Input Area */}
            <InputArea
                input={input}
                setInput={setInput}
                loading={loading}
                uploading={uploading}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                hasDocuments={hasDocuments}
                documentCount={sessionDocumentIds.length}
                inputRef={inputRef}
                fileInputRef={fileInputRef}
                onFileSelect={handleFileSelect}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

// Sub-components

interface WelcomeScreenProps {
    suggestions: Suggestion[];
}

const WelcomeScreen = ({ suggestions }: WelcomeScreenProps) => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <div className="w-16 h-16 rounded-full bg-[#10a37f] flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 text-center">
            How can I help you today?
        </h1>
        <p className="text-[#b4b4b4] text-sm mb-8 text-center max-w-md">
            Upload a document to get started. I'll answer questions based on the content you share.
        </p>

        <p className="text-[#8e8e8e] text-xs mb-4">Example questions you can ask:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} {...suggestion} />
            ))}
        </div>
    </div>
);

const SuggestionCard = ({ title, desc }: Suggestion) => (
    <div className="p-4 rounded-xl border border-[#3d3d3d] bg-transparent opacity-50">
        <p className="text-white font-medium text-sm mb-1">{title}</p>
        <p className="text-[#8e8e8e] text-xs">{desc}</p>
    </div>
);

interface ChatAreaProps {
    messages: ChatMessageType[];
    loading: boolean;
    onDeleteDocument: (id: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatArea = ({ messages, loading, onDeleteDocument, messagesEndRef }: ChatAreaProps) => (
    <div className="py-6 space-y-6">
        {messages.map((message, index) => (
            <ChatMessage
                key={index}
                message={message}
                isUser={message.isUser}
                onDeleteDocument={onDeleteDocument}
            />
        ))}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-4" />
    </div>
);

const TypingIndicator = () => (
    <div className="flex gap-4 animate-slide-in">
        <Avatar type="ai" size="md" />
        <div className="flex items-center gap-1 pt-2">
            <div className="w-2 h-2 rounded-full bg-[#b4b4b4] typing-dot" />
            <div className="w-2 h-2 rounded-full bg-[#b4b4b4] typing-dot" />
            <div className="w-2 h-2 rounded-full bg-[#b4b4b4] typing-dot" />
        </div>
    </div>
);

interface InputAreaProps {
    input: string;
    setInput: (value: string) => void;
    loading: boolean;
    uploading: boolean;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    hasDocuments: boolean;
    documentCount: number;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

const InputArea = ({
    input,
    setInput,
    loading,
    uploading,
    selectedFile,
    setSelectedFile,
    hasDocuments,
    documentCount,
    inputRef,
    fileInputRef,
    onFileSelect,
    onSubmit,
    onKeyDown,
}: InputAreaProps) => (
    <div className="flex-shrink-0 pb-4 pt-2 px-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
        <div className="max-w-3xl mx-auto w-full">
            {/* File Preview */}
            {selectedFile && (
                <FilePreview
                    file={selectedFile}
                    uploading={uploading}
                    onRemove={() => setSelectedFile(null)}
                />
            )}

            {/* Input Container */}
            <form onSubmit={onSubmit} className="chatgpt-input-container flex items-end gap-2 p-2 pl-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={onFileSelect}
                    accept=".pdf,.txt,.md,.csv"
                    className="hidden"
                />

                {/* Attach Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || uploading}
                    className="p-2 rounded-full text-[#b4b4b4] hover:text-white hover:bg-[#3d3d3d] transition-all flex-shrink-0 mb-1"
                    title="Attach file"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                {/* Text Input */}
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={hasDocuments ? 'Ask about your document...' : 'Upload a document first...'}
                    disabled={loading}
                    rows={1}
                    className="flex-1 bg-transparent border-none text-white text-base py-2 px-1 focus:ring-0 focus:outline-none placeholder:text-[#8e8e8e] resize-none max-h-[200px] min-h-[40px]"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="chatgpt-send-btn flex-shrink-0 mb-1"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                    )}
                </button>
            </form>

            {/* Footer Text */}
            <p className="text-center text-[#8e8e8e] text-xs mt-3">
                {hasDocuments
                    ? `Searching within ${documentCount} uploaded document${documentCount !== 1 ? 's' : ''}`
                    : 'Upload a document to start asking questions'}
            </p>
        </div>
    </div>
);

interface FilePreviewProps {
    file: File;
    uploading: boolean;
    onRemove: () => void;
}

const FilePreview = ({ file, uploading, onRemove }: FilePreviewProps) => (
    <div className="mb-3 animate-fade-in">
        <div className="inline-flex items-center gap-3 bg-[#2f2f2f] border border-[#3d3d3d] rounded-lg p-2 pr-3 relative">
            <div className="w-8 h-8 rounded-lg bg-[#10a37f]/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#10a37f]" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm text-white truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-[#8e8e8e]">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <button
                type="button"
                onClick={onRemove}
                disabled={uploading}
                className="ml-2 p-1 rounded-full hover:bg-[#3d3d3d] text-[#8e8e8e] hover:text-white transition-all"
            >
                <X className="w-4 h-4" />
            </button>
            {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-[#10a37f] animate-spin" />
                </div>
            )}
        </div>
    </div>
);

export default Search;
