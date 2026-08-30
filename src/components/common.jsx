import React from "react";

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon size={22} className="text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-xs mb-5">{subtitle}</p>
      {actionLabel && (
        <button onClick={onAction} className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
      <div>
        <h2 className="jaco-display text-2xl font-semibold tracking-wide">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
