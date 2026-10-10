import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    CheckCircle2,
    Command,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Moon,
    Search,
    Shield,
    ShieldCheck,
    Store,
    Sun,
} from 'lucide-react';
import * as React from 'react';
import { AdminCommandPalette } from '@/components/admin/admin-command-palette';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, logout } from '@/routes/admin';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItemType[];
};

export function AdminHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const admin = auth?.admin;
    const getInitials = useInitials();
    const { appearance, updateAppearance } = useAppearance();
    const [paletteOpen, setPaletteOpen] = React.useState(false);

    const adminName = admin?.name || 'Administrator';
    const adminEmail = admin?.email || 'admin@example.com';

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 sm:px-6">
                {/* Left side: Sidebar Toggle & Breadcrumbs */}
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
                    <div className="hidden sm:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Center: Command Palette Trigger */}
                <div className="flex flex-1 justify-center px-2 sm:px-6">
                    <Button
                        variant="outline"
                        onClick={() => setPaletteOpen(true)}
                        className="relative h-9 w-full max-w-xs justify-start rounded-xl border-border/80 bg-muted/40 px-3 text-xs text-muted-foreground shadow-none hover:bg-muted/70 hover:text-foreground md:max-w-sm lg:max-w-md"
                    >
                        <Search className="mr-2 size-3.5 shrink-0" />
                        <span className="truncate">Search commands, users, logs...</span>
                        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium opacity-90 sm:flex">
                            <Command className="size-3" />K
                        </kbd>
                    </Button>
                </div>

                {/* Right side: Status, Storefront, Theme, Notifications & User */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* System Status Pill */}
                    <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                        </span>
                        <span>Operational</span>
                    </div>

                    {/* Storefront Link */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <a href="/" target="_blank" rel="noopener noreferrer">
                                    <Store className="size-4" />
                                    <span className="hidden xl:inline">Storefront</span>
                                    <ExternalLink className="size-3 opacity-70" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open live storefront in new tab</TooltipContent>
                    </Tooltip>

                    {/* Theme Toggle Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="size-9 rounded-lg"
                                aria-label="Toggle color theme"
                            >
                                {appearance === 'dark' ? (
                                    <Sun className="size-4 text-amber-400" />
                                ) : (
                                    <Moon className="size-4 text-slate-700" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Toggle {appearance === 'dark' ? 'light' : 'dark'} mode
                        </TooltipContent>
                    </Tooltip>

                    {/* Notifications Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative size-9 rounded-lg"
                                aria-label="View notifications"
                            >
                                <Bell className="size-4 text-muted-foreground" />
                                <span className="absolute right-2 top-2 size-2 rounded-full bg-indigo-500 ring-2 ring-background" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-2">
                            <div className="flex items-center justify-between px-2 py-1.5">
                                <span className="text-xs font-semibold">
                                    Security & System Alerts
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                    Live
                                </Badge>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="space-y-1 py-1">
                                <div className="rounded-lg p-2 transition-colors hover:bg-muted/50">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 rounded bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="size-3.5" />
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-medium text-foreground">
                                                Admin Session Verified
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Isolated admin guard privileges active.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg p-2 transition-colors hover:bg-muted/50">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 rounded bg-blue-500/10 p-1 text-blue-600 dark:text-blue-400">
                                            <CheckCircle2 className="size-3.5" />
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-medium text-foreground">
                                                Database Pool Healthy
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Zero query bottlenecks detected.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Admin Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative flex items-center gap-2 rounded-full p-1 pl-2 hover:bg-muted"
                            >
                                <div className="hidden flex-col items-end text-right md:flex">
                                    <span className="text-xs font-semibold leading-tight text-foreground">
                                        {adminName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">
                                        Super Admin
                                    </span>
                                </div>
                                <Avatar className="size-8 rounded-full border border-border">
                                    <AvatarFallback className="rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        {getInitials(adminName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-xl" align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold leading-none">
                                        {adminName}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {adminEmail}
                                    </p>
                                    <div className="pt-1">
                                        <Badge
                                            variant="secondary"
                                            className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400"
                                        >
                                            guard: admin
                                        </Badge>
                                    </div>
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
                </div>
            </header>

            {/* Global Command Palette Dialog */}
            <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </>
    );
}
