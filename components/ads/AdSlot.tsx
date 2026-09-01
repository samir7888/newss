export function AdSlot({ label = "Ad" }: { label?: string }) {
    return (
        <div className="ad-slot my-8 flex h-32 items-center justify-center rounded-2xl text-sm font-medium text-slate-500">
            {label}
        </div>
    );
}
