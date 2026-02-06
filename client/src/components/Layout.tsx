import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, BarChart2, Video, Settings, ShieldAlert, LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReportIncidentModal from './ReportIncidentModal';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 flex items-center space-x-2 border-b border-gray-700">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                    <span className="text-xl font-bold tracking-wider">InciScan</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
                    <NavItem to="/feeds" icon={<Video />} label="Live Feeds" />
                    <NavItem to="/incidents" icon={<AlertTriangle />} label="Incidents" />
                    <NavItem to="/analytics" icon={<BarChart2 />} label="Analytics" />
                    <div className="pt-4 border-t border-gray-700">
                        <NavItem to="/settings" icon={<Settings />} label="Settings" />
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
                    <p>System Status: <span className="text-green-400">Online</span></p>
                    <p className="mt-1">v1.0.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-900 relative">
                {/* Header */}
                <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-semibold text-gray-100">Operation Center</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Report Incident
                        </button>

                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-700">
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm text-white font-medium truncate mt-1">
                                            {user?.email || 'User'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-3 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {children}
                </div>

                {/* Report Incident Modal */}
                <ReportIncidentModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                />
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
        }
    >
        <span className="text-current">{icon}</span>
        <span className="font-medium">{label}</span>
    </NavLink>
);

export default Layout;
