import { Icon, IconName } from './icon';

export function createToastContent(icon: IconName, message: string): JSX.Element {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-800">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="font-medium text-slate-800">{message}</span>
    </div>
  );
}
