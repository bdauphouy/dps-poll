"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CustomPoll, PollBuilderQuestion, PollStatus } from "@/types/poll";
import { PollList } from "@/components/dashboard/PollList";
import { PollBuilder } from "@/components/dashboard/PollBuilder";
import {
  createPoll,
  updatePoll,
  deletePoll,
  updatePollStatus,
} from "@/lib/actions/polls";

interface DashboardClientProps {
  initialPolls: CustomPoll[];
}

export function DashboardClient({ initialPolls }: DashboardClientProps) {
  const [polls, setPolls] = useState<CustomPoll[]>(initialPolls);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPoll, setEditingPoll] = useState<CustomPoll | null>(null);
  const [statusChangingPollId, setStatusChangingPollId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sync local state with props when they change (after revalidation)
  useEffect(() => {
    setPolls(initialPolls);
  }, [initialPolls]);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/dashboard/login");
  };

  const handleCreatePoll = async (data: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    logoUrl: string;
    questions: PollBuilderQuestion[];
  }) => {
    try {
      await createPoll(data);
      setShowBuilder(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  };

  const handleUpdatePoll = async (data: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    logoUrl: string;
    questions: PollBuilderQuestion[];
  }) => {
    if (!editingPoll) return;

    try {
      await updatePoll(editingPoll.id, data);
      setEditingPoll(null);
      setShowBuilder(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update poll:", error);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return;

    try {
      await deletePoll(pollId);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete poll:", error);
    }
  };

  const handleStatusChange = async (pollId: string, status: PollStatus) => {
    setStatusChangingPollId(pollId);
    try {
      await updatePollStatus(pollId, status);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update poll status:", error);
    } finally {
      setStatusChangingPollId(null);
    }
  };

  const handleViewStats = (pollId: string) => {
    router.push(`/dashboard/polls/${pollId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold">Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Manage your surveys
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isPending}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh"
              >
                <svg
                  className={`w-5 h-5 ${isPending ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 h-10 text-[15px] font-medium rounded-xl bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {showBuilder || editingPoll ? (
          <PollBuilder
            editingPoll={editingPoll}
            onSave={editingPoll ? handleUpdatePoll : handleCreatePoll}
            onCancel={() => {
              setShowBuilder(false);
              setEditingPoll(null);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Surveys</h2>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-5 py-2.5 text-[15px] font-medium text-white bg-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors"
              >
                + New Survey
              </button>
            </div>
            <PollList
              polls={polls}
              onEdit={(poll) => {
                setEditingPoll(poll);
                setShowBuilder(true);
              }}
              onDelete={handleDeletePoll}
              onViewStats={handleViewStats}
              onStatusChange={handleStatusChange}
              statusChangingPollId={statusChangingPollId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
