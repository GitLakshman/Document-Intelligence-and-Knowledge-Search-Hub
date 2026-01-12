import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Sparkles, ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '../components/ui';

// Types
interface FormData {
    name: string;
    email: string;
    password: string;
}

// Constants
const INITIAL_FORM_DATA: FormData = {
    name: '',
    email: '',
    password: '',
};

const Login = () => {
    const { login, register, isAuthenticated } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (isAuthenticated) {
        return <Navigate to="/search" replace />;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                await register(formData.name, formData.email, formData.password);
            } else {
                await login(formData.email, formData.password);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setFormData(INITIAL_FORM_DATA);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#212121]">
            <div className="w-full max-w-md">
                {/* Header */}
                <LoginHeader />

                {/* Form Card */}
                <div className="bg-[#2f2f2f] border border-[#3d3d3d] rounded-xl p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        {isRegister ? 'Create your account' : 'Welcome back'}
                    </h2>

                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <InputField
                                label="Name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                icon={User}
                                required={isRegister}
                            />
                        )}

                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            icon={Mail}
                            required
                        />

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            icon={Lock}
                            required
                            minLength={6}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            fullWidth
                            size="lg"
                            iconRight={!loading ? ArrowRight : undefined}
                            className="mt-6"
                        >
                            {loading
                                ? isRegister
                                    ? 'Creating account...'
                                    : 'Signing in...'
                                : isRegister
                                    ? 'Create account'
                                    : 'Sign in'}
                        </Button>
                    </form>

                    <AuthModeToggle isRegister={isRegister} onToggle={toggleMode} />
                </div>

                {/* Footer */}
                <p className="text-center text-[#8e8e8e] text-xs mt-6">
                    Unlock the power of your documents with AI-driven insights.
                </p>
            </div>
        </div>
    );
};

// Sub-components

const LoginHeader = () => (
    <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-[#10a37f] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-white">DocIntel</h1>
        <p className="text-[#8e8e8e] mt-2 text-sm">AI-powered document intelligence</p>
    </div>
);

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => (
    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
        {message}
    </div>
);

interface InputFieldProps {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: LucideIcon;
    required?: boolean;
    minLength?: number;
}

const InputField = ({
    label,
    name,
    type,
    value,
    onChange,
    placeholder,
    icon: Icon,
    required,
    minLength,
}: InputFieldProps) => (
    <div>
        <label className="block text-sm font-medium text-[#ececec] mb-2">{label}</label>
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e8e8e]" />
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                className="w-full bg-[#212121] border border-[#3d3d3d] rounded-lg px-4 py-3 pl-11 text-white placeholder:text-[#8e8e8e] focus:outline-none focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] transition-all"
            />
        </div>
    </div>
);

interface AuthModeToggleProps {
    isRegister: boolean;
    onToggle: () => void;
}

const AuthModeToggle = ({ isRegister, onToggle }: AuthModeToggleProps) => (
    <div className="mt-6 pt-6 border-t border-[#3d3d3d] text-center">
        <p className="text-[#8e8e8e] text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
                onClick={onToggle}
                className="ml-2 text-[#10a37f] hover:text-[#0e8c6f] font-medium transition-colors"
                type="button"
            >
                {isRegister ? 'Sign in' : 'Create one'}
            </button>
        </p>
    </div>
);

export default Login;
