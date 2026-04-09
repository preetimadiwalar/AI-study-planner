import React from "react";

const TechnicalDashboard = () => {
  return (
    <div className="relative w-full aspect-[4/3] bg-black/40 border border-primary/20 rounded-xl overflow-hidden p-6 font-mono text-[10px] text-primary/80">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #ff0000 1px, transparent 1px), linear-gradient(to bottom, #ff0000 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Main Layout Grid */}
      <div className="relative h-full grid grid-cols-3 grid-rows-3 gap-4">
        {/* Top Left: Status Indicators */}
        <div className="col-span-1 row-span-1 border border-primary/30 p-3 space-y-2">
          <div className="flex justify-between border-b border-primary/20 pb-1">
            <span>SYSTEM_STATUS</span>
            <span className="text-green-500 animate-pulse">ONLINE</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-primary animate-[width_3s_infinite]" />
            </div>
            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-primary animate-[width_4s_infinite]" />
            </div>
          </div>
        </div>

        {/* Top Center/Right: Data Panel */}
        <div className="col-span-2 row-span-1 border border-primary/30 p-3 flex flex-col justify-between">
          <div className="text-[12px] font-bold">CORE_ANALYTICS_V2.0</div>
          <div className="flex items-end gap-1 h-12">
            {[40, 70, 45, 90, 65, 80, 50, 85, 40, 75, 60, 95].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-primary/40 hover:bg-primary transition-colors"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Mid Left: Code Snippet */}
        <div className="col-span-1 row-span-2 border border-primary/30 p-3 overflow-hidden">
          <div className="text-primary/40 mb-2">// INIT_SEQUENCE</div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-primary/20 rounded" />
            <div className="h-2 w-[80%] bg-primary/20 rounded" />
            <div className="h-2 w-[90%] bg-primary/20 rounded" />
            <div className="h-2 w-[40%] bg-primary/20 rounded" />
            <div className="h-2 w-[70%] bg-primary/20 rounded" />
            <div className="h-2 w-[85%] bg-primary/20 rounded" />
            <div className="h-2 w-[60%] bg-primary/20 rounded" />
          </div>
        </div>

        {/* Center: Main Dashboard Graphic */}
        <div className="col-span-2 row-span-2 border border-primary/30 p-3 relative flex items-center justify-center">
          <svg className="w-full h-full opacity-60" viewBox="0 0 200 100">
            <path 
              d="M0 80 Q 25 20, 50 50 T 100 30 T 150 70 T 200 40" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1"
              className="text-primary"
            />
            <path 
              d="M0 90 Q 30 40, 60 70 T 120 50 T 180 80 T 220 60" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              strokeDasharray="2 2"
              className="text-primary/50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[24px] font-bold text-primary animate-pulse">88.4%</div>
            <div className="text-[8px] tracking-[0.2em]">EFFICIENCY_THRESHOLD</div>
          </div>
        </div>
      </div>

      {/* Decorative Corner Borders */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
    </div>
  );
};

export default TechnicalDashboard;
