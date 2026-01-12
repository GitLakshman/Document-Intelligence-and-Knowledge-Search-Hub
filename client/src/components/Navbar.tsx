import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    MessageSquare,
    History,
    LogOut,
    Menu,
    X,
    Sparkles,
    Plus,
    ChevronDown,
    LucideIcon,
} from 'lucide-react';
import { Avatar } from './ui';

// Types
interface NavLink {
    path: string;
    label: string;
    icon: LucideIcon;
}

// Constants
const NAV_LINKS: NavLink[] = [
    { path: '/search', label: 'Chat', icon: MessageSquare },
    { path: '/history', label: 'History', icon: History },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNewChat = () => {
        navigate('/search');
        window.location.reload();
    };

    const isActive = (path: string): boolean => location.pathname === path;

    return (
        <nav className="bg-[#171717] border-b border-[#3d3d3d] sticky top-0 z-50" id="main-navigation">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Left Section: Logo + Navigation */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <Logo />
                        <DesktopNav links={NAV_LINKS} isActive={isActive} />
                    </div>

                    {/* Right Section: New Chat + User Menu */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <NewChatButton onClick={handleNewChat} />

                        <DesktopUserMenu
                            user={user}
                            isOpen={userMenuOpen}
                            onToggle={() => setUserMenuOpen(!userMenuOpen)}
                            onClose={() => setUserMenuOpen(false)}
                            onLogout={handleLogout}
                        />

                        <MobileMenuButton
                            isOpen={mobileMenuOpen}
                            onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <MobileNav
                    user={user}
                    links={NAV_LINKS}
                    isActive={isActive}
                    onClose={() => setMobileMenuOpen(false)}
                    onLogout={handleLogout}
                />
            )}
        </nav>
    );
};

// Sub-components

const Logo = () => (
    <Link to="/search" className="flex items-center gap-2 md:gap-3 group">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#10a37f] flex items-center justify-center">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <span className="font-semibold text-base md:text-lg text-white hidden sm:block">
            DocIntel
        </span>
    </Link>
);

interface DesktopNavProps {
    links: NavLink[];
    isActive: (path: string) => boolean;
}

const DesktopNav = ({ links, isActive }: DesktopNavProps) => (
    <div className="hidden md:flex items-center gap-1">
        {links.map((link) => (
            <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                        ? 'bg-[#2f2f2f] text-white'
                        : 'text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]'
                    }`}
            >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
            </Link>
        ))}
    </div>
);

interface NewChatButtonProps {
    onClick: () => void;
}

const NewChatButton = ({ onClick }: NewChatButtonProps) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f] transition-all"
    >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Chat</span>
    </button>
);

interface DesktopUserMenuProps {
    user: { name?: string; email?: string } | null;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onLogout: () => void;
}

const DesktopUserMenu = ({ user, isOpen, onToggle, onClose, onLogout }: DesktopUserMenuProps) => (
    <div className="hidden md:block relative">
        <button
            onClick={onToggle}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#2f2f2f] transition-all"
        >
            <Avatar type="user" size="sm" name={user?.name} />
            <ChevronDown
                className={`w-4 h-4 text-[#8e8e8e] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>

        {isOpen && (
            <>
                <div className="fixed inset-0 z-40" onClick={onClose} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#2f2f2f] border border-[#3d3d3d] rounded-lg shadow-xl z-50 animate-fade-in overflow-hidden">
                    <div className="p-3 border-b border-[#3d3d3d]">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-[#8e8e8e] truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#b4b4b4] hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            </>
        )}
    </div>
);

interface MobileMenuButtonProps {
    isOpen: boolean;
    onToggle: () => void;
}

const MobileMenuButton = ({ isOpen, onToggle }: MobileMenuButtonProps) => (
    <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-lg hover:bg-[#2f2f2f] text-[#b4b4b4]"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
);

interface MobileNavProps {
    user: { name?: string; email?: string } | null;
    links: NavLink[];
    isActive: (path: string) => boolean;
    onClose: () => void;
    onLogout: () => void;
}

const MobileNav = ({ user, links, isActive, onClose, onLogout }: MobileNavProps) => (
    <div className="md:hidden border-t border-[#3d3d3d] animate-fade-in bg-[#171717]">
        <div className="px-4 py-3 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-[#2f2f2f] rounded-lg">
                <Avatar type="user" size="md" name={user?.name} />
                <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-[#8e8e8e] truncate">{user?.email}</p>
                </div>
            </div>

            {/* Nav Links */}
            {links.map((link) => (
                <Link
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                            ? 'bg-[#2f2f2f] text-white'
                            : 'text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]'
                        }`}
                >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                </Link>
            ))}

            {/* Logout */}
            <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 w-full"
            >
                <LogOut className="w-5 h-5" />
                Log out
            </button>
        </div>
    </div>
);

export default Navbar;
