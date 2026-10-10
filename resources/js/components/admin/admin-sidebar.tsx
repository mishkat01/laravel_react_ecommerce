import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    ChevronsUpDown,
    ExternalLink,
    FileText,
    LayoutDashboard,
    LogOut,
    Moon,
    Server,
    Shield,
    ShieldCheck,
    Store,
    Sun,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, logout } from '@/routes/admin';

export function AdminSidebar() {
    const { auth } = usePage().props;
    const admin = auth?.admin;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const { appearance, updateAppearance } = useAppearance();
    const { state, isMobile } = useSidebar();

    const adminName = admin?.name || 'Administrator';
    const adminEmail = admin?.email || 'admin@example.com';

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const isDashboardActive = isCurrentUrl(dashboard.url());

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header: Admin Brand & Guard Status */}
            <SidebarHeader className="border-b border-sidebar-border/60 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sidebar-accent"
                        >
                            <Link href={dashboard()} className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                                    <AppLogoIcon className="size-5 fill-current" />
                                </div>
                                <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                                            Admin Portal
                                        </span>
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Control Center
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Status pill in expanded mode */}
                <div className="mt-1 px-2 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="size-3.5" />
                            <span>Admin Guard</span>
                        </span>
                        <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-background/50 px-1.5 py-0 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                        >
                            auth:admin
                        </Badge>
                    </div>
                </div>
            </SidebarHeader>

            {/* Content: Organized Admin Navigation */}
            <SidebarContent className="gap-1 py-2">
                {/* Core Overview Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isDashboardActive}
                                    tooltip={{ children: 'Dashboard' }}
                                >
                                    <Link href={dashboard()} prefetch>
                                        <LayoutDashboard className="size-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden">
                                    Live
                                </SidebarMenuBadge>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'Analytics & KPIs' }}
                                >
                                    <a href="#metrics">
                                        <Activity className="size-4" />
                                        <span>Key Metrics</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Management Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'User Accounts' }}
                                >
                                    <a href="#users">
                                        <Users className="size-4" />
                                        <span>Customer Accounts</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'Teams & Workspaces' }}
                                >
                                    <a href="#teams">
                                        <Building2 className="size-4" />
                                        <span>Workspaces & Teams</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'Admin Security' }}
                                >
                                    <a href="#security">
                                        <Shield className="size-4" />
                                        <span>Access & Guard</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* System & Architecture Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>System & Logs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'System Health' }}
                                >
                                    <a href="#system">
                                        <Server className="size-4" />
                                        <span>System Health</span>
                                    </a>
                                </SidebarMenuButton>
                                <SidebarMenuBadge className="text-emerald-500 group-data-[collapsible=icon]:hidden">
                                    99.9%
                                </SidebarMenuBadge>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'Audit Trail' }}
                                >
                                    <a href="#audit">
                                        <FileText className="size-4" />
                                        <span>Audit & Activity Log</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* External Links Group */}
                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: 'View Storefront' }}
                                >
                                    <a
                                        href="/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/link flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Store className="size-4 text-muted-foreground group-hover/link:text-foreground" />
                                            <span>Live Storefront</span>
                                        </div>
                                        <ExternalLink className="size-3 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer: Admin Profile & Session Actions */}
            <SidebarFooter className="border-t border-sidebar-border/60 pt-2">
                {/* Mini System Info in expanded mode */}
                <div className="rounded-lg bg-sidebar-accent/50 p-2.5 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center justify-between font-mono">
                        <span>PHP 8.5 • Laravel 12</span>
                        <span className="text-emerald-500 font-semibold">Online</span>
                    </div>
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent group"
                                >
                                    <Avatar className="size-8 rounded-lg border border-border">
                                        <AvatarFallback className="rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {getInitials(adminName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold text-sidebar-foreground">
                                            {adminName}
                                        </span>
                                        <span className="truncate text-[10px] text-muted-foreground">
                                            {adminEmail}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-60 rounded-xl"
                                align="end"
                                side={
                                    isMobile
                                        ? 'bottom'
                                        : state === 'collapsed'
                                          ? 'right'
                                          : 'top'
                                }
                                sideOffset={8}
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold leading-none">
                                                {adminName}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-mono"
                                            >
                                                Admin
                                            </Badge>
                                        </div>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {adminEmail}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={dashboard()} className="cursor-pointer">
                                        <LayoutDashboard className="mr-2 size-4" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={toggleTheme}
                                    className="cursor-pointer"
                                >
                                    {appearance === 'dark' ? (
                                        <Sun className="mr-2 size-4 text-amber-400" />
                                    ) : (
                                        <Moon className="mr-2 size-4 text-slate-700" />
                                    )}
                                    <span>
                                        {appearance === 'dark' ? 'Light mode' : 'Dark mode'}
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={logout()}
                                        method="post"
                                        as="button"
                                        className="w-full cursor-pointer text-destructive focus:text-destructive"
                                        data-test="admin-logout-button"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
