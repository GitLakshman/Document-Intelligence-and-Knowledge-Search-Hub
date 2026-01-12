import React, { useState, useEffect, useCallback } from 'react';
import { searchAPI } from '../api';
import {
    History as HistoryIcon,
    MessageSquare,
    Trash2,
    ChevronDown,
    FileText,
    Calendar,
    Search as SearchIcon,
    ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Query, Reference } from '../types';
import {
    Avatar,
    Button,
    EmptyState,
    ErrorState,
    LoadingSpinner,
    MarkdownContent,
} from '../components/ui';

const History = () => {
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQueries, setTotalQueries] = useState(0);
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await searchAPI.getHistory(page, 10);
            if (response?.data) {
                setQueries(response.data.queries || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalQueries(response.data.totalQueries || 0);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: any) {
            console.error('Fetch history error:', err);
            setError('Could not load history. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this query from your history?')) return;

        try {
            await searchAPI.deleteQuery(id);
            setQueries((prev) => prev.filter((q) => q?._id !== id));
            setTotalQueries((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete query');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Clear your entire search history? This cannot be undone.'))
            return;

        setClearing(true);
        try {
            await searchAPI.clearHistory();
            setQueries([]);
            setTotalQueries(0);
            setTotalPages(1);
            setPage(1);
        } catch (err) {
            console.error('Clear history error:', err);
            alert('Failed to clear history');
        } finally {
            setClearing(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId((prevId) => (prevId === id ? null : id));
    };

    const formatDate = (date: string) => {
        if (!date) return 'Unknown date';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (error) {
        return <ErrorState message={error} onRetry={fetchHistory} />;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#212121]">
            <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
                {/* Header */}
                <HistoryHeader
                    totalQueries={totalQueries}
                    hasQueries={queries.length > 0}
                    onClearAll={handleClearAll}
                    clearing={clearing}
                />

                {/* Content */}
                {loading && queries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" text="Loading history..." />
                    </div>
                ) : !queries || queries.length === 0 ? (
                    <EmptyState
                        icon={SearchIcon}
                        title="No history yet"
                        description="Your conversations will appear here after you start asking questions."
                        action={
                            <Link
                                to="/search"
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#10a37f] hover:bg-[#0e8c6f] text-white rounded-lg font-medium transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Start a conversation
                            </Link>
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {queries.map((query) => {
                            if (!query) return null;
                            const isExpanded = expandedId === query._id;

                            return (
                                <QueryCard
                                    key={query._id}
                                    query={query}
                                    isExpanded={isExpanded}
                                    onToggle={() => toggleExpand(query._id)}
                                    onDelete={(e) => handleDelete(e, query._id)}
                                    onContinue={() =>
                                        navigate('/search', { state: { question: query.question } })
                                    }
                                    formatDate={formatDate}
                                />
                            );
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPrevious={() => {
                                    setPage((p) => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onNext={() => {
                                    setPage((p) => Math.min(totalPages, p + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components for better organization

interface HistoryHeaderProps {
    totalQueries: number;
    hasQueries: boolean;
    onClearAll: () => void;
    clearing: boolean;
}

const HistoryHeader = ({
    totalQueries,
    hasQueries,
    onClearAll,
    clearing,
}: HistoryHeaderProps) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-3">
                <HistoryIcon className="w-6 h-6 text-[#10a37f]" />
                Search History
            </h1>
            {totalQueries > 0 && (
                <p className="text-[#8e8e8e] text-sm mt-1">
                    {totalQueries} conversation{totalQueries !== 1 ? 's' : ''}
                </p>
            )}
        </div>
        {hasQueries && (
            <Button
                variant="danger"
                icon={Trash2}
                onClick={onClearAll}
                loading={clearing}
                className="self-start"
            >
                Clear All
            </Button>
        )}
    </div>
);

interface QueryCardProps {
    query: Query;
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onContinue: () => void;
    formatDate: (date: string) => string;
}

const QueryCard = ({
    query,
    isExpanded,
    onToggle,
    onDelete,
    onContinue,
    formatDate,
}: QueryCardProps) => (
    <div
        className={`bg-[#171717] border rounded-xl overflow-hidden transition-all cursor-pointer ${isExpanded ? 'border-[#4e4e4e]' : 'border-[#3d3d3d] hover:border-[#4e4e4e]'
            }`}
        onClick={onToggle}
    >
        {/* Query Header */}
        <div className="p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#8e8e8e] mb-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(query.createdAt)}
                    </div>
                    <p className="font-medium text-white text-sm md:text-base leading-snug">
                        {query.question}
                    </p>
                    {!isExpanded && (
                        <p className="text-[#8e8e8e] text-sm mt-2 line-clamp-1">
                            {query.answer}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg text-[#8e8e8e] hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div
                        className={`p-1 rounded transition-transform ${isExpanded ? 'rotate-180' : ''
                            }`}
                    >
                        <ChevronDown className="w-5 h-5 text-[#8e8e8e]" />
                    </div>
                </div>
            </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
            <ExpandedContent
                query={query}
                onContinue={onContinue}
            />
        )}
    </div>
);

interface ExpandedContentProps {
    query: Query;
    onContinue: () => void;
}

const ExpandedContent = ({ query, onContinue }: ExpandedContentProps) => (
    <div className="px-4 pb-4 pt-2 border-t border-[#3d3d3d] animate-fade-in">
        <div className="space-y-4">
            {/* AI Response */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Avatar type="ai" size="sm" />
                    <span className="text-xs font-medium text-[#8e8e8e] uppercase tracking-wide">
                        Response
                    </span>
                </div>
                <MarkdownContent content={query.answer} compact />
            </div>

            {/* Sources */}
            {query.references && query.references.length > 0 && (
                <SourcesSection references={query.references} />
            )}

            {/* Continue Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onContinue();
                }}
                className="flex items-center gap-2 text-sm text-[#10a37f] hover:text-[#0e8c6f] transition-all mt-2"
            >
                <ArrowRight className="w-4 h-4" />
                Continue this conversation
            </button>
        </div>
    </div>
);

interface SourcesSectionProps {
    references: Reference[];
}

const SourcesSection = ({ references }: SourcesSectionProps) => (
    <div className="pt-4 border-t border-[#3d3d3d]">
        <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#10a37f]" />
            <span className="text-xs font-medium text-[#8e8e8e] uppercase tracking-wide">
                Sources ({references.length})
            </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
            {references.map((ref, index) => (
                <div
                    key={index}
                    className="bg-[#2f2f2f] rounded-lg p-3 border border-[#3d3d3d]"
                >
                    <p className="font-medium text-xs text-[#ececec] mb-1 truncate">
                        {ref.documentName}
                    </p>
                    <p className="text-xs text-[#8e8e8e] italic line-clamp-2">
                        "{ref.excerpt}"
                    </p>
                </div>
            ))}
        </div>
    </div>
);

interface PaginationProps {
    page: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
}

const Pagination = ({ page, totalPages, onPrevious, onNext }: PaginationProps) => (
    <div className="flex items-center justify-between pt-6 border-t border-[#3d3d3d] mt-6">
        <span className="text-sm text-[#8e8e8e]">
            Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={page === 1}
            >
                Previous
            </Button>
            <Button
                variant="primary"
                onClick={onNext}
                disabled={page === totalPages}
            >
                Next
            </Button>
        </div>
    </div>
);

export default History;
