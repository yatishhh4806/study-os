export default function Visualizer({ paused }) {
  if (paused) {
    return (
      <div className="flex h-5 items-end gap-[3px] opacity-40">
        <span className="h-2 w-[3px] rounded-full bg-violet-400" />
        <span className="h-3 w-[3px] rounded-full bg-violet-400" />
        <span className="h-4 w-[3px] rounded-full bg-violet-400" />
        <span className="h-3 w-[3px] rounded-full bg-violet-400" />
        <span className="h-2 w-[3px] rounded-full bg-violet-400" />
      </div>
    );
  }

  return (
    <div className="visualizer">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}