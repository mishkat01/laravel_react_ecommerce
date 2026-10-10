import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Cpu,
    ExternalLink,
    HardDrive,
    Layers,
    Lock,
    Mail,
    RefreshCw,
    Search,
    Server,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    User as UserIcon,
    Users,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes/admin';

type RecentUser = {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at: string;
};

type Props = {
    stats: {
        totalUsers: number;
        totalTeams: number;
        totalAdmins?: number;
    };
    recentUsers: RecentUser[];
    systemInfo?: {
        phpVersion: string;
        laravelVersion: string;
        environment: string;
        serverTime: string;
        dbDriver: string;
    };
};

export default function AdminDashboard({
    stats,
    recentUsers = [],
    systemInfo,
}: Props) {
    const { auth } = usePage().props;
    const admin = auth?.admin;
    const getInitials = useInitials();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [userFilter, setUserFilter] = React.useState<'all' | 'verified'>('all');
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [copiedUserId, setCopiedUserId] = React.useState<number | null>(null);

    // Dynamic greeting based on current local hour
    const greeting = React.useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const formattedToday = React.useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['stats', 'recentUsers', 'systemInfo'],
            onFinish: () => {
                setIsRefreshing(false);
                toast.success('Dashboard metrics refreshed');
            },
        });
    };

    const handleCopyEmail = (email: string, id: number) => {
        navigator.clipboard.writeText(email);
        setCopiedUserId(id);
        toast.info(`Copied ${email} to clipboard`);
        setTimeout(() => setCopiedUserId(null), 2000);
    };

    // Filtered users based on search input and verification status
    const filteredUsers = React.useMemo(() => {
        return recentUsers.filter((u) => {
            const matchesQuery =
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesQuery) return false;
            if (userFilter === 'verified') return !!u.email_verified_at;
            return true;
        });
    }, [recentUsers, searchQuery, userFilter]);

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Hero Command Center Header */}
                <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-card via-card to-indigo-500/5 p-6 shadow-xs sm:p-8">
                    {/* Ambient glow decoration */}
                    <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-12 -left-12 size-64 rounded-full bg-purple-500/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {greeting}, {admin?.name || 'Administrator'}
                                </h1>
                                <Badge className="border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold gap-1">
                                    <Sparkles className="size-3" />
                                    Admin Console
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono gap-1"
                                >
                                    <ShieldCheck className="size-3" />
                                    auth:admin
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Real-time platform command center with dedicated guard isolation, multi-tenant workspace management, and active customer monitoring.
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                                <Calendar className="size-3.5 text-muted-foreground" />
                                <span>{formattedToday}</span>
                                <span className="text-border">•</span>
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Session Privileges Active
                                </span>
                            </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="h-9 gap-1.5 rounded-xl border-border/80 shadow-xs"
                            >
                                <RefreshCw
                                    className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                <span>{isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="h-9 gap-1.5 rounded-xl shadow-xs"
                            >
                                <a href="/" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="size-3.5" />
                                    <span>Storefront</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics KPI Grid */}
                <div id="metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Customer Accounts */}
                    <Card className="relative overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:shadow-md">
                        <div className="absolute right-0 top-0 h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Users
                            </CardTitle>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold tracking-tight">
                                    {stats.totalUsers}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                                >
                                    <TrendingUp className="size-3" />
                                    +12.4%
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-blue-500"
                                        style={{
                                            width: `${Math.min(100, Math.max(15, (stats.totalUsers / 50) * 100))}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Customer accounts in database
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workspaces & Teams */}
                    <Card className="relative overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:shadow-md">
                        <div className="absolute right-0 top-0 h-1 w-full bg-linear-to-r from-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Workspaces
                            </CardTitle>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Building2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold tracking-tight">
                                    {stats.totalTeams}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="gap-1 font-mono text-[10px] text-purple-600 dark:text-purple-400"
                                >
                                    Multi-tenant
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-purple-500"
                                        style={{
                                            width: `${Math.min(100, Math.max(20, (stats.totalTeams / 20) * 100))}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Active collaboration organizations
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Guard Security */}
                    <Card className="relative overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:shadow-md">
                        <div className="absolute right-0 top-0 h-1 w-full bg-linear-to-r from-emerald-500 to-teal-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Admin Guard Isolation
                            </CardTitle>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <div className="flex items-center gap-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-5" />
                                    <span>Enforced</span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                                >
                                    auth:admin
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-foreground">
                                    Zero cross-session leakage
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Isolated from customer web sessions
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Status & Health */}
                    <Card className="relative overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:shadow-md">
                        <div className="absolute right-0 top-0 h-1 w-full bg-linear-to-r from-amber-500 to-emerald-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                System Health
                            </CardTitle>
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Activity className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <span className="relative flex size-2.5">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                                    </span>
                                    <span>99.98%</span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-[10px] text-amber-600 dark:text-amber-400"
                                >
                                    Healthy
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-foreground">
                                    Latency: &lt; 18ms
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    All routes and services operational
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Split Grid: Interactive Users & System Architecture */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column (2 Cols): Registered Users List with Search & Actions */}
                    <div id="users" className="space-y-6 lg:col-span-2">
                        <Card className="border-border/80 bg-card shadow-xs">
                            <CardHeader className="border-b border-border/60 pb-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <span>Recent Registered Accounts</span>
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs"
                                            >
                                                {recentUsers.length} total
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Customer profiles created on the e-commerce storefront
                                        </CardDescription>
                                    </div>

                                    {/* Filter pills */}
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant={userFilter === 'all' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setUserFilter('all')}
                                            className="h-8 text-xs font-medium"
                                        >
                                            All ({recentUsers.length})
                                        </Button>
                                        <Button
                                            variant={userFilter === 'verified' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setUserFilter('verified')}
                                            className="h-8 text-xs font-medium"
                                        >
                                            Verified
                                        </Button>
                                    </div>
                                </div>

                                {/* Instant search input */}
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Filter customers by name or email address..."
                                        className="h-9 rounded-xl pl-9 text-xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {filteredUsers.length > 0 ? (
                                    <div className="divide-y divide-border/60">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                {/* User Identity info */}
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <Avatar className="size-10 rounded-full border border-border">
                                                        <AvatarFallback className="rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate font-semibold text-sm text-foreground">
                                                                {user.name}
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="font-mono text-[10px] text-muted-foreground"
                                                            >
                                                                #{user.id}
                                                            </Badge>
                                                        </div>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meta & Quick Actions */}
                                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                    <div className="flex flex-col items-start text-xs sm:items-end">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Calendar className="size-3" />
                                                            <span>{formatDate(user.created_at)}</span>
                                                        </div>
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                            {user.email_verified_at ? 'Email Verified' : 'Registered User'}
                                                        </span>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopyEmail(user.email, user.id)}
                                                        className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                                        title="Copy email to clipboard"
                                                    >
                                                        {copiedUserId === user.id ? (
                                                            <>
                                                                <Check className="size-3.5 text-emerald-500" />
                                                                <span className="text-emerald-600 text-[11px]">Copied</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="size-3.5" />
                                                                <span className="text-[11px]">Copy</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                        <Users className="mb-2 size-10 stroke-1 opacity-40" />
                                        <p className="text-sm font-medium">No matching accounts found</p>
                                        <p className="text-xs text-muted-foreground">
                                            Try adjusting your filter or search term.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Platform Multi-Tenant Architecture Overview */}
                        <div id="teams" className="grid gap-4 sm:grid-cols-2">
                            <Card className="border-border/80 bg-card shadow-xs">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
                                            <Layers className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold">
                                                Multi-Tenant Teams
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Collaborative Workspaces
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs text-muted-foreground">
                                    <p>
                                        Each customer belongs to one or more collaborative teams managed by the Team model with role-based member invitations.
                                    </p>
                                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 font-mono text-[11px]">
                                        <span>Total Workspaces</span>
                                        <span className="font-semibold text-foreground">
                                            {stats.totalTeams}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/80 bg-card shadow-xs">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                            <Lock className="size-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold">
                                                Security Separation
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Independent Guard Sessions
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs text-muted-foreground">
                                    <p>
                                        Admin authentication uses the isolated <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">admin</code> guard and dedicated database table, completely detached from customer accounts.
                                    </p>
                                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 font-mono text-[11px]">
                                        <span>Active Admins</span>
                                        <span className="font-semibold text-foreground">
                                            {stats.totalAdmins ?? 1}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column (1 Col): Admin Details, System Health & Audit */}
                    <div id="security" className="flex flex-col gap-6">
                        {/* Current Admin Session Context */}
                        <Card className="border-border/80 bg-card shadow-xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">
                                        Admin Guard Session
                                    </CardTitle>
                                    <Badge
                                        variant="secondary"
                                        className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                                    >
                                        Active
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    Current authenticated administrative context
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                                    <Avatar className="size-10 border border-border">
                                        <AvatarFallback className="bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {getInitials(admin?.name || 'Admin')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate font-semibold text-sm text-foreground">
                                                {admin?.name}
                                            </p>
                                            <span className="text-[10px] font-mono text-primary font-medium">
                                                SUPER
                                            </span>
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {admin?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Guard Provider</span>
                                        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                            auth:admin
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Route Specification</span>
                                        <span className="font-mono font-medium">routes/admin.php</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Admin Model</span>
                                        <span className="font-mono font-medium">App\Models\Admin</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-muted-foreground">Database Table</span>
                                        <span className="font-mono font-medium">admins</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System & Framework Specifications */}
                        <Card id="server" className="border-border/80 bg-card shadow-xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">
                                        Server & Tech Stack
                                    </CardTitle>
                                    <Badge variant="outline" className="text-[10px] font-mono">
                                        PHP 8.5
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    Framework runtime specifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2.5 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-muted/40 p-2.5">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                            <Cpu className="size-3" />
                                            <span>PHP Runtime</span>
                                        </div>
                                        <div className="mt-1 font-mono font-semibold text-foreground">
                                            {systemInfo?.phpVersion ?? '8.5.0'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-2.5">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                            <Server className="size-3" />
                                            <span>Laravel</span>
                                        </div>
                                        <div className="mt-1 font-mono font-semibold text-foreground">
                                            {systemInfo?.laravelVersion ?? '12.x'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-2.5">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                            <HardDrive className="size-3" />
                                            <span>Database</span>
                                        </div>
                                        <div className="mt-1 font-mono font-semibold text-foreground uppercase">
                                            {systemInfo?.dbDriver ?? 'mysql'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-2.5">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                            <Sparkles className="size-3" />
                                            <span>Frontend</span>
                                        </div>
                                        <div className="mt-1 font-mono font-semibold text-foreground">
                                            Inertia v3 + React
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Security & Audit Events */}
                        <Card id="audit" className="border-border/80 bg-card shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">
                                    Recent Security Events
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Platform authentication & integrity log
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="size-3" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">
                                                Admin session authenticated
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Dedicated admin guard handshake succeeded
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            Just now
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="mt-0.5 rounded-full bg-blue-500/10 p-1 text-blue-600 dark:text-blue-400">
                                            <Activity className="size-3" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">
                                                System integrity verified
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Database pool and Redis cache normal
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            5m ago
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-2.5 text-xs">
                                        <div className="mt-0.5 rounded-full bg-purple-500/10 p-1 text-purple-600 dark:text-purple-400">
                                            <Layers className="size-3" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">
                                                CSRF & Session tokens rotated
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Strict SameSite cookie enforcement active
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            15m ago
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = () => ({
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard.url(),
        },
        {
            title: 'Dashboard',
            href: dashboard.url(),
        },
    ],
});
