import { Head, Link } from '@inertiajs/react';
import { Eye, LogOut, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import CreateTeamModal from '@/components/create-team-modal';
import Heading from '@/components/heading';
import LeaveTeamModal from '@/components/leave-team-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { edit, index } from '@/routes/teams';
import type { Team } from '@/types';

/**
 * Props passed from Laravel's `TeamController::index()`
 */
type Props = {
    teams: Team[];
};

/**
 * Teams Index Page
 *
 * Displays all workspaces/teams the authenticated user belongs to.
 *
 * Concepts:
 * 1. Multi-Tenant Role Logic: Inspects `team.role` to determine if user can edit vs view only.
 * 2. Guardrails: Personal teams and Owner memberships cannot be left (`canLeaveTeam`).
 * 3. Modal State Lifting: Controls `<LeaveTeamModal>` and `<CreateTeamModal>`.
 */
export default function TeamsIndex({ teams }: Props) {
    // State for the "Leave Team" confirmation dialog
    const [leaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false);
    const [teamLeaving, setTeamLeaving] = useState<Team | null>(null);

    /**
     * Opens confirmation dialog to leave the specified team
     */
    const openLeaveTeamDialog = (team: Team) => {
        setTeamLeaving(team);
        setLeaveTeamDialogOpen(true);
    };

    return (
        <>
            <Head title="Teams" />

            <h1 className="sr-only">Teams</h1>

            <div className="flex flex-col space-y-6">
                {/* Header with New Team creation trigger */}
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Teams"
                        description="Manage your teams and team memberships"
                    />

                    {/* Dialog to create a brand new team */}
                    <CreateTeamModal>
                        <Button data-test="teams-new-team-button">
                            <Plus /> New team
                        </Button>
                    </CreateTeamModal>
                </div>

                {/* Team cards list */}
                <div className="space-y-3">
                    {teams.map((team) => {
                        // Users can only leave non-personal teams where they are not the sole owner
                        const canLeaveTeam =
                            !team.isPersonal && team.role !== 'owner';

                        return (
                            <div
                                key={team.id}
                                data-test="team-row"
                                className="flex items-center justify-between gap-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {team.name}
                                            </span>
                                            {team.isPersonal ? (
                                                <Badge variant="secondary">
                                                    Personal
                                                </Badge>
                                            ) : null}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {team.roleLabel}
                                        </span>
                                    </div>
                                </div>

                                <TooltipProvider>
                                    <div className="flex items-center gap-2">
                                        {/* Leave Team Button */}
                                        {canLeaveTeam ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="team-leave-button"
                                                        onClick={() =>
                                                            openLeaveTeamDialog(
                                                                team,
                                                            )
                                                        }
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Leave team</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : null}

                                        {/* View or Edit Team Button based on user's role */}
                                        {team.role === 'member' ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="team-view-button"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit(
                                                                team.slug,
                                                            )}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>View team</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="team-edit-button"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit(
                                                                team.slug,
                                                            )}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit team</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TooltipProvider>
                            </div>
                        );
                    })}

                    {teams.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                            You don't belong to any teams yet.
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Leave Team Modal */}
            <LeaveTeamModal
                team={teamLeaving}
                open={leaveTeamDialogOpen}
                onOpenChange={setLeaveTeamDialogOpen}
            />
        </>
    );
}

/**
 * Breadcrumbs configuration
 */
TeamsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Teams',
            href: index(),
        },
    ],
};

