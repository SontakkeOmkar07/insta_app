import React from 'react';
import { useData } from '../../context/DataCOntext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast } = useData();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-12 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-neutral-900/90 dark:bg-neutral-100/90 text-white dark:text-neutral-900 rounded-xl shadow-xl backdrop-blur-md text-sm font-medium animate-in slide-in-from-right-4 duration-200 max-w-sm w-[calc(100%-2.5rem)] sm:w-auto">
      {icons[toast.type || 'success']}
      <span className="truncate">{toast.message}</span>
    </div>
  );
};
