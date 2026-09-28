import React from 'react';

interface TelemetryCardProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'rose' | 'amber' | 'green' | 'none';
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  glow = 'none',
}) => {
  let glowClasses = '';
  if (glow === 'cyan') glowClasses = 'shadow-hud-cyan border-cyan-500/40';
  if (glow === 'rose') glowClasses = 'shadow-hud-rose border-rose-500/50';
  if (glow === 'amber') glowClasses = 'shadow-hud-amber border-amber-500/40';
  if (glow === 'green') glowClasses = 'shadow-hud-green border-emerald-500/40';

  return (
    <div
      className={`relative bg-space-900/90 border border-space-800 rounded-xl p-4 sm:p-5 backdrop-blur-md overflow-hidden transition-all ${glowClasses} ${className}`}
    >
      {/* Corner Aerospace HUD Crosshairs */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/40 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/40 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/40 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/40 rounded-br pointer-events-none" />

      {(title || badge || action) && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-space-800/80">
          <div>
            {title && (
              <h3 className="text-sm font-semibold font-mono tracking-wide text-slate-200 flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
