import {ReactNode} from 'react';

export function EmptyState({title, description, action}: Readonly<{title: string; description: string; action?: ReactNode}>) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl bg-void/30 border border-white/5 shadow-l1 relative overflow-hidden">
      <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center mb-6 relative">
         <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />
         <div className="w-2 h-2 rounded-full bg-accent" />
      </div>
      <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter italic mb-2">{title}</h3>
      <p className="mx-auto max-w-sm text-[11px] font-mono text-secondary uppercase leading-relaxed tracking-wider mb-8">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
