import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const baseFieldClasses =
  'block w-full rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent-specialist focus:outline-none focus:ring-2 focus:ring-accent-specialist/25 disabled:cursor-not-allowed disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...rest },
  ref,
) {
  return <input ref={ref} className={[baseFieldClasses, className].join(' ')} {...rest} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[baseFieldClasses, 'resize-y leading-relaxed', className].join(' ')}
      {...rest}
    />
  );
});

export function FieldLabel({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center justify-between text-xs font-medium text-ink-muted"
    >
      <span>{children}</span>
      {hint && <span className="text-[11px] font-normal text-ink-faint">{hint}</span>}
    </label>
  );
}
