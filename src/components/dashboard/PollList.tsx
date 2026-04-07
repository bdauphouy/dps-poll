"use client";

import { useRouter } from "next/navigation";
import { CustomPoll, PollStatus } from "@/types/poll";

interface PollListProps {
  polls: CustomPoll[];
  onEdit: (poll: CustomPoll) => void;
  onDelete: (pollId: string) => void;
  onViewStats: (pollId: string) => void;
  onStatusChange: (pollId: string, status: PollStatus) => void;
  statusChangingPollId?: string | null;
}

const statusConfig: Record<
  PollStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: "Draft", color: "text-muted-foreground", bgColor: "bg-secondary" },
  active: { label: "Active", color: "text-[#30D158]", bgColor: "bg-[#30D158]/10" },
  ended: { label: "Ended", color: "text-destructive", bgColor: "bg-destructive/10" },
};

function PollCard({
  poll,
  onEdit,
  onDelete,
  onViewStats,
  onStatusChange,
  isStatusChanging,
}: {
  poll: CustomPoll;
  onEdit: (poll: CustomPoll) => void;
  onDelete: (pollId: string) => void;
  onViewStats: (pollId: string) => void;
  onStatusChange: (pollId: string, status: PollStatus) => void;
  isStatusChanging?: boolean;
}) {
  const router = useRouter();

  const copyLink = (e: React.MouseEvent, pollId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(url);
  };

  const handleCardClick = () => {
    router.push(`/poll/${poll.id}`);
  };

  const config = statusConfig[poll.status];

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden cursor-pointer hover:bg-card/80 transition-colors"
      onClick={handleCardClick}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Logo */}
          {poll.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poll.logoUrl}
              alt=""
              className="w-12 h-12 rounded-xl object-contain bg-secondary shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[15px] truncate">{poll.title}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}
              >
                {config.label}
              </span>
            </div>
            {poll.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {poll.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {poll.questions.length} question
              {poll.questions.length !== 1 ? "s" : ""} •{" "}
              {poll.responseCount || 0} response
              {poll.responseCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {/* Status actions */}
          {poll.status === "draft" && (
            <button
              onClick={() => onStatusChange(poll.id, "active")}
              disabled={isStatusChanging}
              className="px-3 py-1.5 text-sm font-medium text-[#30D158] bg-[#30D158]/10 rounded-lg cursor-pointer hover:bg-[#30D158]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isStatusChanging ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              Activate
            </button>
          )}
          {poll.status === "active" && (
            <button
              onClick={() => onStatusChange(poll.id, "ended")}
              disabled={isStatusChanging}
              className="px-3 py-1.5 text-sm font-medium text-destructive bg-destructive/10 rounded-lg cursor-pointer hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isStatusChanging ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              End
            </button>
          )}
          {poll.status === "ended" && (
            <button
              onClick={() => onStatusChange(poll.id, "active")}
              disabled={isStatusChanging}
              className="px-3 py-1.5 text-sm font-medium text-[#30D158] bg-[#30D158]/10 rounded-lg cursor-pointer hover:bg-[#30D158]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isStatusChanging ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              Reactivate
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={(e) => copyLink(e, poll.id)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
            title="Copy link"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewStats(poll.id)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
            title="View stats"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => onEdit(poll)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
            title="Edit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(poll.id)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PollList({
  polls,
  onEdit,
  onDelete,
  onViewStats,
  onStatusChange,
  statusChangingPollId,
}: PollListProps) {
  const activePolls = polls.filter((p) => p.status === "active");
  const draftPolls = polls.filter((p) => p.status === "draft");
  const endedPolls = polls.filter((p) => p.status === "ended");

  if (polls.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No surveys created yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first survey to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
            Active ({activePolls.length})
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewStats={onViewStats}
                onStatusChange={onStatusChange}
                isStatusChanging={statusChangingPollId === poll.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Draft Polls */}
      {draftPolls.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
            Drafts ({draftPolls.length})
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {draftPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewStats={onViewStats}
                onStatusChange={onStatusChange}
                isStatusChanging={statusChangingPollId === poll.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ended Polls */}
      {endedPolls.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
            Ended ({endedPolls.length})
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {endedPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewStats={onViewStats}
                onStatusChange={onStatusChange}
                isStatusChanging={statusChangingPollId === poll.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
