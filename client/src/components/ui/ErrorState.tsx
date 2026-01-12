import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
    /** Error title */
    title?: string;
    /** Error message */
    message: string;
    /** Retry callback */
    onRetry?: () => void;
    /** Custom retry button text */
    retryText?: string;
}

const ErrorState = ({
    title = 'Something went wrong',
    message,
    onRetry,
    retryText = 'Try Again',
}: ErrorStateProps) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-[#2f2f2f] border border-[#3d3d3d] rounded-xl p-8 max-w-md w-full text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
                <p className="text-[#8e8e8e] mb-6">{message}</p>
                {onRetry && (
                    <button onClick={onRetry} className="btn-primary w-full">
                        {retryText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorState;
