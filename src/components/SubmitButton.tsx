'use client';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ children, className = 'btn primary' }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'Ukládám…' : children}
    </button>
  );
}

export function ConfirmButton({ children, message, className = 'btn danger small' }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
    >
      {children}
    </button>
  );
}
