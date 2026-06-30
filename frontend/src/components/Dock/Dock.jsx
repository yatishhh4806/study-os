import { useState } from "react";

export default function Dock({
  items,
  baseItemSize = 60,
}) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex gap-4 rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
      {items.map((item, index) => {
        const Icon = item.icon;

        const scale =
          hovered === index
            ? 1.3
            : hovered === index - 1 || hovered === index + 1
            ? 1.1
            : 1;

        return (
          <button
            key={item.label}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className="
              relative
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-[#121019]
              transition-all
              duration-300
            "
            style={{
              transform: `scale(${scale})`,
            }}
          >
            <Icon
              size={22}
              className="text-white"
            />

            {hovered === index && (
              <div
                className="
                  absolute
                  -top-12
                  rounded-lg
                  border
                  border-white/10
                  bg-black
                  px-3
                  py-2
                  text-xs
                  text-white
                "
              >
                {item.label}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}