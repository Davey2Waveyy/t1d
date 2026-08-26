import Sheet from '../ui/Sheet';

const ITEMS = [
  {
    icon: 'warning',
    title: 'Post-dinner rise detected',
    body: 'Your demo timeline shows a glucose climb after dinner. A real account would connect this to meal timing and insulin.',
    tone: 'glucose-high',
  },
  {
    icon: 'water_drop',
    title: 'Morning range looks steady',
    body: 'The guest dataset is spending most of the morning inside target, which is a nice calm baseline for the dashboard.',
    tone: 'glucose-normal',
  },
];

export default function GuestNotificationsSheet({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Guest notifications">
      <div className="flex flex-col gap-sm">
        {ITEMS.map((item) => (
          <article key={item.title} className="rounded-xl border border-border-subtle bg-surface-raised p-md">
            <div className="flex items-start gap-sm">
              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${item.tone}/20 text-${item.tone}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div className="flex flex-col gap-xs">
                <h3 className="font-body text-body-base font-semibold text-text-primary">{item.title}</h3>
                <p className="font-body text-[13px] leading-relaxed text-text-secondary">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Sheet>
  );
}
