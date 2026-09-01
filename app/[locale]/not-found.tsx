import Link from "next/link";

export default function LocaleNotFound() {
    return (
        <main className="container-shell flex min-h-screen items-center justify-center py-20">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">404</p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
                <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
                <Link href="/ne" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
                    Back to home
                </Link>
            </div>
        </main>
    );
}
