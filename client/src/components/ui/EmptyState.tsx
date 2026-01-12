import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    /** Icon to display */
    icon: LucideIcon;
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Optional action element (button, link, etc.) */
    action?: ReactNode;
    /** Icon color class */
    iconColor?: string;
}

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    iconColor = 'text-[#8e8e8e]',
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2f2f2f] flex items-center justify-center mb-6">
                <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-[#8e8e8e] text-sm mb-8 max-w-xs">{description}</p>
            )}
            {action}
        </div>
    );
};

export default EmptyState;
