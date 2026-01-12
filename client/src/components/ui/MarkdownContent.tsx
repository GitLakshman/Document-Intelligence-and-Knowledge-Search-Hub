import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
    /** Markdown content to render */
    content: string;
    /** Whether to strip [SOURCE X] annotations */
    stripSourceAnnotations?: boolean;
    /** Additional className for the container */
    className?: string;
    /** Compact mode with smaller text */
    compact?: boolean;
}

const MarkdownContent = ({
    content,
    stripSourceAnnotations = true,
    className = '',
    compact = false,
}: MarkdownContentProps) => {
    const processedContent = stripSourceAnnotations
        ? content.replace(/\[SOURCE \d+\]/gi, '').trim()
        : content;

    const textSize = compact ? 'text-sm' : 'text-[15px]';
    const spacing = compact ? 'prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5' : 'prose-p:my-3 prose-headings:mt-4 prose-headings:mb-2';

    return (
        <div
            className={`
                text-[#ececec] ${textSize} leading-relaxed prose prose-invert max-w-none
                ${spacing} prose-ul:my-2 prose-li:my-0.5
                ${className}
            `}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ node, ...props }: any) => (
                        <p className="text-[#ececec] leading-relaxed" {...props} />
                    ),
                    strong: ({ node, ...props }: any) => (
                        <strong className="font-semibold text-white" {...props} />
                    ),
                    ul: ({ node, ...props }: any) => (
                        <ul className="list-disc ml-5 space-y-1" {...props} />
                    ),
                    ol: ({ node, ...props }: any) => (
                        <ol className="list-decimal ml-5 space-y-1" {...props} />
                    ),
                    li: ({ node, ...props }: any) => (
                        <li className="text-[#ececec]" {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) =>
                        inline ? (
                            <code
                                className="bg-[#2f2f2f] px-1.5 py-0.5 rounded text-[#10a37f] font-mono text-sm"
                                {...props}
                            />
                        ) : (
                            <code
                                className="block bg-[#2f2f2f] p-3 rounded-lg text-[#ececec] font-mono text-sm overflow-x-auto"
                                {...props}
                            />
                        ),
                    pre: ({ node, ...props }: any) => (
                        <pre className="bg-[#2f2f2f] rounded-lg overflow-x-auto my-3" {...props} />
                    ),
                    blockquote: ({ node, ...props }: any) => (
                        <blockquote
                            className="border-l-2 border-[#10a37f] pl-4 italic text-[#b4b4b4] my-3"
                            {...props}
                        />
                    ),
                    a: ({ node, ...props }: any) => (
                        <a className="text-[#10a37f] hover:underline" {...props} />
                    ),
                    h1: ({ node, ...props }: any) => (
                        <h1 className="text-xl font-semibold text-white" {...props} />
                    ),
                    h2: ({ node, ...props }: any) => (
                        <h2 className="text-lg font-semibold text-white" {...props} />
                    ),
                    h3: ({ node, ...props }: any) => (
                        <h3 className="text-base font-semibold text-white" {...props} />
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
