import { AdminShell } from "@/components/admin/AdminShell";

const recentRuns = [
    { id: 1, status: "Published 8 stories", time: "2 hours ago" },
    { id: 2, status: "Deduped 12 duplicates", time: "yesterday" },
    { id: 3, status: "No new stories found", time: "2 days ago" },
];

export default function AdminPage() {
    return (
        <AdminShell>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Candidates</div>
                    <div className="mt-2 text-3xl font-bold">42</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Published</div>
                    <div className="mt-2 text-3xl font-bold">8</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Duplicates</div>
                    <div className="mt-2 text-3xl font-bold">12</div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="mb-4 text-xl font-semibold">Recent runs</h2>
                <ul className="space-y-3">
                    {recentRuns.map((run) => (
                        <li key={run.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                            <span>{run.status}</span>
                            <span className="text-sm text-slate-500">{run.time}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </AdminShell>
    );
}
