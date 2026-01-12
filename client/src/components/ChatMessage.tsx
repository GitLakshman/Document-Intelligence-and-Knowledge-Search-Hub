import { FileText, ChevronDown, ChevronUp, Trash2, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { Avatar, MarkdownContent } from './ui';

interface ChatMessageProps {
    message: ChatMessageType;
    isUser: boolean;
    onDeleteDocument?: (id: string) => void;
}

const ChatMessage = ({ message, isUser, onDeleteDocument }: ChatMessageProps) => {
    const [showReferences, setShowReferences] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleDelete = async () => {
        if (!message.attachedFile?.id || !onDeleteDocument) return;
        if (window.confirm(`Delete "${message.attachedFile.name}"?`)) {
            setIsDeleting(true);
            try {
                await onDeleteDocument(message.attachedFile.id);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // User Message
    if (isUser) {
        return (
            <div className="flex justify-end animate-slide-in">
                <div className="max-w-[85%] md:max-w-[70%]">
                    {message.type === 'file' && message.attachedFile ? (
                        <FileAttachment
                            file={message.attachedFile}
                            onDelete={onDeleteDocument ? handleDelete : undefined}
                            isDeleting={isDeleting}
                        />
                    ) : (
                        <div className="bg-[#2f2f2f] rounded-2xl px-4 py-3">
                            <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                                {message.content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // AI Message
    return (
        <div className="flex gap-4 animate-slide-in group">
            <Avatar type="ai" size="md" />

            <div className="flex-1 min-w-0">
                <MarkdownContent content={message.content} />

                {/* Action Buttons */}
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg text-[#8e8e8e] hover:text-white hover:bg-[#2f2f2f] transition-all"
                        title="Copy"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-[#10a37f]" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* References Section */}
                {message.references && message.references.length > 0 && (
                    <ReferencesSection
                        references={message.references}
                        showReferences={showReferences}
                        onToggle={() => setShowReferences(!showReferences)}
                    />
                )}
            </div>
        </div>
    );
};

// Sub-components for better modularity

interface FileAttachmentProps {
    file: { id: string; name: string; size: number };
    onDelete?: () => void;
    isDeleting: boolean;
}

const FileAttachment = ({ file, onDelete, isDeleting }: FileAttachmentProps) => (
    <div className="flex items-center gap-3 bg-[#2f2f2f] rounded-2xl p-3 group relative">
        <div className="w-10 h-10 rounded-lg bg-[#10a37f]/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#10a37f]" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-[#8e8e8e]">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
        </div>
        {onDelete && (
            <button
                onClick={onDelete}
                disabled={isDeleting}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#8e8e8e] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
            >
                {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        )}
    </div>
);

interface ReferencesSectionProps {
    references: Array<{ documentName: string; excerpt: string }>;
    showReferences: boolean;
    onToggle: () => void;
}

const ReferencesSection = ({
    references,
    showReferences,
    onToggle,
}: ReferencesSectionProps) => (
    <div className="mt-4">
        <button
            onClick={onToggle}
            className="flex items-center gap-2 text-sm text-[#8e8e8e] hover:text-[#b4b4b4] transition-all py-1"
        >
            <FileText className="w-4 h-4" />
            <span>
                {references.length} source{references.length !== 1 ? 's' : ''}
            </span>
            {showReferences ? (
                <ChevronUp className="w-4 h-4" />
            ) : (
                <ChevronDown className="w-4 h-4" />
            )}
        </button>

        {showReferences && (
            <div className="mt-3 space-y-2 animate-fade-in">
                {references.map((ref, index) => (
                    <div
                        key={index}
                        className="bg-[#171717] border border-[#3d3d3d] rounded-lg p-3 hover:border-[#4e4e4e] transition-all"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-[#2f2f2f] flex items-center justify-center">
                                <FileText className="w-3 h-3 text-[#10a37f]" />
                            </div>
                            <span className="text-sm font-medium text-[#ececec] truncate">
                                {ref.documentName}
                            </span>
                        </div>
                        <p className="text-xs text-[#8e8e8e] italic leading-relaxed line-clamp-3">
                            "{ref.excerpt}"
                        </p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default ChatMessage;
