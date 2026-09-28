import type { BadgeProgress as BadgeProgressData } from '../types';
import { useLanguage } from '../LanguageContext';

export function BadgeProgress({ progress, tone = 'neutral' }: { progress: BadgeProgressData; tone?: 'amber' | 'emerald' | 'neutral' }) {
  const { language } = useLanguage();
  const current = Math.max(0, progress.current);
  const target = Math.max(0, progress.target);
  const percentage = target ? Math.min(100, (current / target) * 100) : 0;
  const unit = language === 'ar' ? (progress.unit === 'days' ? 'أيام' : 'إجراءات') : progress.unit;
  const fillClass = tone === 'amber' ? 'bg-amber-500' : tone === 'emerald' ? 'bg-emerald-600' : 'bg-editorial-charcoal/60';

  return <div className="mt-3">
    <p className="text-[10px] font-bold text-editorial-charcoal/65">{current} / {target} {unit}</p>
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-editorial-charcoal/10" role="progressbar" aria-label={language === 'ar' ? `التقدم: ${current} من ${target} ${unit}` : `Progress: ${current} of ${target} ${unit}`} aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(current, target)}>
      <div className={`h-full rounded-full transition-[width] ${fillClass}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>;
}
