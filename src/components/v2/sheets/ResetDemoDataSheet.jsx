import { useState } from 'react';
import Sheet from '../ui/Sheet';
import { resetDemoData } from '../../../lib/dataService';

export default function ResetDemoDataSheet({ open, onOpenChange }) {
  const [resetting, setResetting] = useState(false);

  function confirmReset() {
    setResetting(true);
    resetDemoData();
    setResetting(false);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Reset demo data">
      <div className="flex flex-col gap-md">
        <p className="font-body text-body-base text-text-secondary">
          This deletes every glucose reading, meal, and insulin dose added to this guest demo — by you or by an agent
          — and restores the original seeded sample data. It does not touch your account, settings, or sign-in.
        </p>
        <button
          type="button"
          onClick={confirmReset}
          disabled={resetting}
          className="bg-glucose-low text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {resetting ? 'Resetting…' : 'Reset demo data'}
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="py-sm rounded-full font-medium text-text-secondary active:scale-[0.98] transition-transform"
        >
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
