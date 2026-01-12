import { LucideIcon, Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button style variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Icon to show before text */
    icon?: LucideIcon;
    /** Icon to show after text */
    iconRight?: LucideIcon;
    /** Show loading spinner */
    loading?: boolean;
    /** Full width button */
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#10a37f] hover:bg-[#0e8c6f] text-white',
    secondary: 'bg-[#2f2f2f] hover:bg-[#3d3d3d] text-white border border-[#3d3d3d]',
    ghost: 'text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]',
    danger: 'text-red-400 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40',
    outline: 'border border-[#3d3d3d] text-[#ececec] hover:bg-[#2f2f2f]',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
};

const iconSizeMap: Record<ButtonSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            icon: Icon,
            iconRight: IconRight,
            loading = false,
            fullWidth = false,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const iconSize = iconSizeMap[size];

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
                    inline-flex items-center justify-center rounded-lg font-medium transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${fullWidth ? 'w-full' : ''}
                    ${className}
                `}
                {...props}
            >
                {loading ? (
                    <Loader2 className={`${iconSize} animate-spin`} />
                ) : Icon ? (
                    <Icon className={iconSize} />
                ) : null}
                {children}
                {IconRight && !loading && <IconRight className={iconSize} />}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
