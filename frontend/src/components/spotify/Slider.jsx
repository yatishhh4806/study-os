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
      className="relative flex h-5 w-full touch-none select-none items-center"
    >
      <SliderPrimitive.Track className="relative h-[5px] grow rounded-full bg-white/10">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-violet-500" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-violet-500 bg-white shadow-lg transition hover:scale-125 focus:outline-none" />
    </SliderPrimitive.Root>
  );
}