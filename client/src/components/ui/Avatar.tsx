import { LucideIcon, Sparkles, User } from 'lucide-react';

type AvatarType = 'user' | 'ai' | 'custom';
type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
    /** Avatar type */
    type?: AvatarType;
    /** Size of the avatar */
    size?: AvatarSize;
    /** User's name (for initial) or text to display */
    name?: string;
    /** Custom icon for 'custom' type */
    icon?: LucideIcon;
    /** Custom background class */
    bgClass?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; icon: string; text: string }> = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs' },
    md: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { container: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' },
};

const Avatar = ({
    type = 'user',
    size = 'md',
    name,
    icon: CustomIcon,
    bgClass,
}: AvatarProps) => {
    const sizes = sizeStyles[size];

    // Determine background color
    const getBgClass = () => {
        if (bgClass) return bgClass;
        switch (type) {
            case 'ai':
                return 'bg-[#10a37f]';
            case 'user':
                return 'bg-gradient-to-br from-[#10a37f] to-[#1a7f5a]';
            default:
                return 'bg-[#2f2f2f]';
        }
    };

    // Determine icon or content
    const getContent = () => {
        if (type === 'ai') {
            return <Sparkles className={`${sizes.icon} text-white`} />;
        }
        if (type === 'custom' && CustomIcon) {
            return <CustomIcon className={`${sizes.icon} text-white`} />;
        }
        if (name) {
            return (
                <span className={`${sizes.text} font-medium text-white`}>
                    {name.charAt(0).toUpperCase()}
                </span>
            );
        }
        return <User className={`${sizes.icon} text-white`} />;
    };

    return (
        <div
            className={`
                ${sizes.container} rounded-full flex items-center justify-center flex-shrink-0
                ${getBgClass()}
            `}
        >
            {getContent()}
        </div>
    );
};

export default Avatar;
