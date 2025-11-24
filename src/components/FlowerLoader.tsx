 export function FlowerLoader({ theme }: { theme: "day" | "night" }) {
  const isDark = theme === "night";

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Květinová animace */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Střed květu */}
        <div
          className={`w-6 h-6 rounded-full absolute z-10 animate-ping 
            ${isDark ? "bg-emerald-400" : "bg-emerald-500"}
          `}
        />

        {/* Okvětní lístky */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`
              w-4 h-4 rounded-full absolute 
              animate-flower-pulse
              ${isDark ? "bg-emerald-300/80" : "bg-emerald-400/80"}
            `}
            style={{
              transform: `rotate(${i * 60}deg) translate(26px)`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
