export default function PlaylistSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="aspect-square rounded-xl bg-white/10" />

      <div className="mt-4 h-5 w-3/4 rounded bg-white/10" />

      <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
    </div>
  );
}