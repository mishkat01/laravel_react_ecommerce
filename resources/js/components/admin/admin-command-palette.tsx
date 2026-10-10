import { router } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    ExternalLink,
    HardDrive,
    LayoutDashboard,
    LogOut,
    Moon,
    Search,
    Shield,
    Sun,
    Users,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, logout } from '@/routes/admin';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type CommandItem = {
    id: string;
    title: string;
    category: 'Navigation' | 'Actions' | 'System';
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
};

export function AdminCommandPalette({ open, onOpenChange }: Props) {
    const [query, setQuery] = React.useState('');
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = React.useCallback(() => {
        const nextTheme = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(nextTheme);
        toast.info(`Switched to ${nextTheme} mode`);
        onOpenChange(false);
    }, [appearance, updateAppearance, onOpenChange]);

    const commands: CommandItem[] = React.useMemo(
        () => [
            {
                id: 'nav-dashboard',
                title: 'Go to Dashboard',
                category: 'Navigation',
                description: 'Overview metrics and recent platform activity',
                icon: LayoutDashboard,
                action: () => {
                    router.visit(dashboard.url());
                    onOpenChange(false);
                },
            },
            {
                id: 'nav-users',
                title: 'User Accounts',
                category: 'Navigation',
                description: 'Jump to customer accounts and registrations',
                icon: Users,
                action: () => {
                    router.visit(`${dashboard.url()}#users`);
                    onOpenChange(false);
                },
            },
            {
                id: 'nav-teams',
                title: 'Workspaces & Teams',
                category: 'Navigation',
                description: 'View active multi-tenant collaboration teams',
                icon: Building2,
                action: () => {
                    router.visit(`${dashboard.url()}#teams`);
                    onOpenChange(false);
                },
            },
            {
                id: 'nav-system',
                title: 'System Health & Latency',
                category: 'System',
                description: 'Monitor server uptime, PHP 8.5 status and routes',
                icon: Activity,
                action: () => {
                    router.visit(`${dashboard.url()}#system`);
                    onOpenChange(false);
                },
            },
            {
                id: 'nav-security',
                title: 'Admin Guard & Security',
                category: 'System',
                description: 'Review isolated session privileges and guard settings',
                icon: Shield,
                action: () => {
                    router.visit(`${dashboard.url()}#security`);
                    onOpenChange(false);
                },
            },
            {
                id: 'action-storefront',
                title: 'Open Storefront',
                category: 'Actions',
                description: 'View the live public storefront in a new tab',
                icon: ExternalLink,
                action: () => {
                    window.open('/', '_blank', 'noopener,noreferrer');
                    onOpenChange(false);
                },
            },
            {
                id: 'action-theme',
                title: `Switch Theme to ${appearance === 'dark' ? 'Light' : 'Dark'} Mode`,
                category: 'Actions',
                description: 'Toggle between dark and light color palettes',
                icon: appearance === 'dark' ? Sun : Moon,
                action: toggleTheme,
            },
            {
                id: 'action-logout',
                title: 'Log Out of Admin Session',
                category: 'Actions',
                description: 'Safely terminate your authenticated admin guard session',
                icon: LogOut,
                action: () => {
                    router.post(logout.url());
                    onOpenChange(false);
                },
            },
        ],
        [appearance, toggleTheme, onOpenChange],
    );

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return commands;
        return commands.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                (item.description && item.description.toLowerCase().includes(q)),
        );
    }, [query, commands]);

    // Keyboard shortcut to open Cmd+K
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                onOpenChange(!open);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl overflow-hidden p-0 shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Admin Command Center</DialogTitle>
                    <DialogDescription>
                        Quickly search and execute administrative actions
                    </DialogDescription>
                </DialogHeader>

                {/* Search input header */}
                <div className="flex items-center border-b border-border/80 px-4">
                    <Search className="mr-3 size-4 shrink-0 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search (e.g. users, health, theme)..."
                        className="h-14 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
                        autoFocus
                    />
                    <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                        ESC to close
                    </Badge>
                </div>

                {/* Command results list */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {filtered.length > 0 ? (
                        <div className="space-y-1">
                            {filtered.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={item.action}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-hidden"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-foreground">
                                                    {item.title}
                                                </p>
                                                {item.description && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="ml-2 text-[10px] font-mono shrink-0"
                                        >
                                            {item.category}
                                        </Badge>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No commands or links found for "{query}".
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
                            ⌘K
                        </kbd>
                        <span>to toggle palette anytime</span>
                    </span>
                    <span className="font-mono text-[10px] text-primary">
                        Admin Guard • Isolated Session
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
