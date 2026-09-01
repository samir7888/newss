export function AdminShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="container-shell py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin</p>
                        <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
                    </div>
                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                        Run now
                    </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
