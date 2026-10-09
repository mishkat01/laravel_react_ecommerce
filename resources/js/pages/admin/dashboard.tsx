import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    Mail,
    Server,
    ShieldAlert,
    ShieldCheck,
    User as UserIcon,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

type RecentUser = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

type Props = {
    stats: {
        totalUsers: number;
        totalTeams: number;
    };
    recentUsers: RecentUser[];
};

export default function AdminDashboard({ stats, recentUsers }: Props) {
    const { auth } = usePage().props;
    const admin = auth?.admin;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Welcome & Header Banner */}
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-linear-to-r from-card to-accent/20 p-6 shadow-xs sm:flex-row sm:items-center">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Welcome, {admin?.name || 'Administrator'}
                            </h1>
                            <Badge className="bg-primary/15 text-primary border-primary/25 font-semibold">
                                Admin Portal
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You are authenticated using the dedicated{' '}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                                admin
                            </code>{' '}
                            guard with isolated session privileges.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1.5 size-3.5" />
                                View Storefront
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Users */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Users
                            </CardTitle>
                            <div className="rounded-md bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalUsers}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Registered customer accounts
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Teams */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Workspaces / Teams
                            </CardTitle>
                            <div className="rounded-md bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
                                <Building2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalTeams}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active collaborative teams
                            </p>
                        </CardContent>
                    </Card>

                    {/* Admin Guard Status */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Authentication Guard
                            </CardTitle>
                            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-4" />
                                <span>auth:admin</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Isolated from web user session
                            </p>
                        </CardContent>
                    </Card>

                    {/* System Status */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                System Health
                            </CardTitle>
                            <div className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                                <Activity className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-lg font-bold">
                                <span className="relative flex size-2.5">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                                </span>
                                Operational
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                All routes and services running
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid: Recent Users & Admin Session Information */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Users List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Registered Users</CardTitle>
                                    <CardDescription>
                                        Latest customer accounts created on the platform
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {recentUsers.length} shown
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentUsers.length > 0 ? (
                                <div className="divide-y divide-border/60">
                                    {recentUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-full bg-muted font-medium text-foreground">
                                                    <UserIcon className="size-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {user.name}
                                                    </p>
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="size-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="size-3" />
                                                <span>{formatDate(user.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <Users className="mb-2 size-8 stroke-1 opacity-50" />
                                    <p className="text-sm">No registered users found in the database.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Environment & Auth Details */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Admin Session Details
                                </CardTitle>
                                <CardDescription>
                                    Current authenticated context
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-lg bg-muted/60 p-3">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Administrator
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {admin?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {admin?.email}
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Guard</span>
                                        <span className="font-mono font-medium text-primary">admin</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">Route file</span>
                                        <span className="font-mono font-medium">routes/admin.php</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                                        <span className="text-muted-foreground">User Model</span>
                                        <span className="font-mono font-medium">App\Models\Admin</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-muted-foreground">Table</span>
                                        <span className="font-mono font-medium">admins</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Separation of Concerns
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Customer logins at <code className="font-mono text-foreground">/login</code> use Laravel Fortify and team workspaces.
                                </p>
                                <p>
                                    Admin access is completely isolated at <code className="font-mono text-foreground">/admin</code> using a separate session driver, guard, and table.
                                </p>
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
