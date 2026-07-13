import * as SliderPrimitive from "@radix-ui/react-slider";

export default function Slider({
  value,
  max,
  onValueChange,
  onValueCommit,
}) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      max={max}
      step={1}
      onValueChange={(v) => onValueChange(v[0])}
      onValueCommit={(v) => onValueCommit(v[0])}
      className="group relative flex h-7 w-full touch-none select-none items-center"
    >
      {/* Background Track */}
      <SliderPrimitive.Track className="relative h-[6px] grow overflow-hidden rounded-full bg-white/10 transition-all duration-300 group-hover:h-[8px]">
        {/* Filled Track */}
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_18px_rgba(139,92,246,0.6)]" />
      </SliderPrimitive.Track>

      {/* Thumb */}
      <SliderPrimitive.Thumb className="
        block
        h-5
        w-5
        rounded-full
        border-2
        border-white/80
        bg-white
        shadow-[0_0_20px_rgba(255,255,255,0.35)]
        transition-all
        duration-200
        hover:scale-125
        hover:border-violet-400
        hover:shadow-[0_0_30px_rgba(139,92,246,0.8)]
        focus:outline-none
        active:scale-110
      " />
    </SliderPrimitive.Root>
  );
}