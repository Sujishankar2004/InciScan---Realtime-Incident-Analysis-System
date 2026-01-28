import { useEffect, useState } from 'react';
import { BadgeAlert, Users, Activity, MapPin, Map } from 'lucide-react';
import { io } from 'socket.io-client';

// Types
interface Incident {
    id: number;
    type: string;
    severity: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    status: string;
}

interface Stats {
    total: number;
    critical: number;
    resolved: number;
    active: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats>({
        total: 12,
        critical: 3,
        resolved: 8,
        active: 4
    });

    const [recentIncidents, setRecentIncidents] = useState<Incident[]>([
        { id: 1, type: 'Crowd Hazard', severity: 'High', latitude: 40.7128, longitude: -74.0060, timestamp: '2 mins ago', status: 'Active' },
        { id: 2, type: 'Theft', severity: 'Medium', latitude: 40.7328, longitude: -74.0160, timestamp: '15 mins ago', status: 'Investigation' },
        { id: 3, type: 'Violence Detected', severity: 'Critical', latitude: 40.7228, longitude: -74.0010, timestamp: '32 mins ago', status: 'Resolved' },
    ]);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to InciScan socket server');
        });

        socket.on('new_incident', (incident: any) => {
            console.log('New Incident received:', incident);
            const newInc: Incident = {
                id: incident.id,
                type: incident.type,
                severity: incident.severity,
                latitude: incident.latitude,
                longitude: incident.longitude,
                timestamp: 'Just now',
                status: incident.status
            };

            setRecentIncidents(prev => [newInc, ...prev.slice(0, 9)]);
            setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Incidents" value={stats.total} icon={<Activity />} color="blue" />
                <StatCard title="Critical Alerts" value={stats.critical} icon={<BadgeAlert />} color="red" />
                <StatCard title="Active Crowds" value={stats.active} icon={<Users />} color="yellow" />
                <StatCard title="Resolved" value={stats.resolved} icon={<MapPin />} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-[500px] relative flex items-center justify-center">
                    <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-gray-300">
                        LIVE MAP FEED
                    </div>
                    <div className="text-center text-gray-400">
                        <Map className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-lg font-medium">Map View</p>
                        <p className="text-sm mt-2">Showing {recentIncidents.length} incidents</p>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                            {recentIncidents.slice(0, 3).map(inc => (
                                <div key={inc.id} className="bg-gray-700/50 p-2 rounded">
                                    <p className="text-white font-medium">{inc.type}</p>
                                    <p className="text-gray-500">{inc.latitude.toFixed(2)}, {inc.longitude.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Recent Alerts */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-[500px]">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Recent Alerts</h2>
                        <span className="text-xs text-red-400 animate-pulse">● Live Updates</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {recentIncidents.map((incident) => (
                            <div key={incident.id} className="p-3 bg-gray-700/50 rounded-lg border-l-4 border-red-500 hover:bg-gray-700 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-white">{incident.type}</h3>
                                    <span className="text-xs text-gray-400">{incident.timestamp}</span>
                                </div>
                                <div className="mt-1 flex justify-between items-center text-sm">
                                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(incident.severity)}`}>
                                        {incident.severity}
                                    </span>
                                    <span className="text-gray-400 text-xs">ID: #{incident.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
        case 'critical': return 'bg-red-500/20 text-red-400';
        case 'high': return 'bg-orange-500/20 text-orange-400';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-green-500/20 text-green-400';
    }
};

const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-500',
        red: 'bg-red-500/10 text-red-500',
        yellow: 'bg-yellow-500/10 text-yellow-500',
        green: 'bg-green-500/10 text-green-500',
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-gray-700 text-white'}`}>
                {icon}
            </div>
        </div>
    );
};

export default Dashboard;
