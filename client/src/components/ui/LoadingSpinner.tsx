import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
    /** Show the branded spinner with logo */
    branded?: boolean;
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg';
    /** Optional loading text */
    text?: string;
    /** Whether to center the spinner in its container */
    centered?: boolean;
}

const sizeMap = {
    sm: { spinner: 'w-4 h-4', logo: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { spinner: 'w-6 h-6', logo: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { spinner: 'w-8 h-8', logo: 'w-16 h-16', icon: 'w-8 h-8' },
};

const LoadingSpinner = ({
    branded = false,
    size = 'md',
    text,
    centered = true,
}: LoadingSpinnerProps) => {
    const sizes = sizeMap[size];

    if (branded) {
        return (
            <div className={`flex flex-col items-center gap-4 ${centered ? 'justify-center' : ''}`}>
                <div className={`${sizes.logo} rounded-xl bg-[#10a37f] flex items-center justify-center`}>
                    <Sparkles className={`${sizes.icon} text-white animate-pulse`} />
                </div>
                <Loader2 className={`${sizes.spinner} text-[#10a37f] animate-spin`} />
                {text && <p className="text-[#8e8e8e] text-sm">{text}</p>}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${centered ? 'justify-center' : ''}`}>
            <Loader2 className={`${sizes.spinner} text-[#10a37f] animate-spin`} />
            {text && <p className="text-[#8e8e8e] text-sm">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
