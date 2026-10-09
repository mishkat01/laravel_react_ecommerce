import { Link, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Moon,
    Shield,
    Sun,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
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
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
};

export default function AdminLayout({ breadcrumbs = [], children }: Props) {
    const { auth } = usePage().props;
    const admin = auth?.admin;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const { appearance, updateAppearance } = useAppearance();

    const adminName = admin?.name || 'Administrator';
    const adminEmail = admin?.email || 'admin@example.com';

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-6">
                        <Link
                            href={dashboard()}
                            className="flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-90"
                        >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                                <AppLogoIcon className="size-5 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold leading-none tracking-tight">
                                    Admin Portal
                                </span>
                                <span className="text-[10px] text-muted-foreground leading-tight">
                                    Control Center
                                </span>
                            </div>
                        </Link>

                        <Badge
                            variant="secondary"
                            className="hidden gap-1 font-mono text-xs sm:inline-flex"
                        >
                            <Shield className="size-3 text-primary" />
                            Admin Guard
                        </Badge>

                        {/* Navigation items */}
                        <nav className="hidden items-center gap-1 md:flex">
                            <Link
                                href={dashboard()}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    isCurrentUrl(dashboard.url())
                                        ? 'bg-accent text-accent-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <LayoutDashboard className="size-4" />
                                Dashboard
                            </Link>
                        </nav>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        {/* Storefront Link */}
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            <a href="/" target="_blank" rel="noopener noreferrer">
                                <span className="hidden sm:inline">Storefront</span>
                                <ExternalLink className="size-3.5 sm:ml-1" />
                            </a>
                        </Button>

                        {/* Theme Toggle Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="size-9"
                            aria-label="Toggle theme"
                        >
                            {appearance === 'dark' ? (
                                <Sun className="size-4 text-amber-400" />
                            ) : (
                                <Moon className="size-4 text-slate-700" />
                            )}
                        </Button>

                        {/* Admin User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative flex items-center gap-2.5 rounded-full p-1 pl-2 hover:bg-muted"
                                >
                                    <div className="hidden flex-col items-end text-right sm:flex">
                                        <span className="text-xs font-semibold leading-tight">
                                            {adminName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground leading-tight">
                                            Administrator
                                        </span>
                                    </div>
                                    <Avatar className="size-8 border border-border">
                                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                            {getInitials(adminName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {adminName}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {adminEmail}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={dashboard()}
                                        className="cursor-pointer"
                                    >
                                        <LayoutDashboard className="mr-2 size-4" />
                                        Dashboard
                                    </Link>
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
                </div>
            </header>

            {/* Breadcrumb sub-header if provided */}
            {breadcrumbs.length > 0 && (
                <div className="border-b border-border/40 bg-muted/30">
                    <div className="mx-auto flex h-10 max-w-7xl items-center px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
                        {breadcrumbs.map((item, index) => (
                            <span key={item.title} className="flex items-center">
                                {index > 0 && <span className="mx-2 text-border">/</span>}
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="hover:text-foreground"
                                    >
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-foreground">
                                        {item.title}
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Page Content */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
