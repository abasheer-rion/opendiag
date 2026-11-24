import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function Header({ title, onBack }: { title: string; onBack?: (() => void) | undefined }) {
  return (
    <>
      <header>
        {onBack ? (
          <button className="back" onClick={onBack}>&lt; Back</button>
        ) : (
          <span className="spacer" />
        )}
        <h1>{title}</h1>
        <span className="spacer" />
      </header>
      <div className="banner"><b>SIMULATOR</b> Pretend car. Read-only build. No car connected.</div>
    </>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <div className="list">{children}</div>;
}

export function Section({ title }: { title: string }) {
  return <h2>{title}</h2>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="note">{children}</p>;
}

interface RowProps {
  label: ReactNode;
  value?: ReactNode;
  sub?: ReactNode;
  /** When set the row is a button with a ">" on the right. */
  onOpen?: () => void;
}

export function Row({ label, value, sub, onOpen }: RowProps) {
  const body = (
    <>
      <div className="l">
        {label}
        {sub ? <div className="sub">{sub}</div> : null}
      </div>
      {value ? <div className="r">{value}</div> : null}
      {onOpen ? <span className="chev" aria-hidden="true" /> : null}
    </>
  );
  return onOpen ? (
    <button className="row" onClick={onOpen}>{body}</button>
  ) : (
    <div className="row">{body}</div>
  );
}

export interface Loaded<T> {
  data: T | undefined;
  error: string | undefined;
}

/** Run an async read when the screen opens. */
export function useLoad<T>(fn: () => Promise<T>, deps: readonly unknown[]): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({ data: undefined, error: undefined });
  useEffect(() => {
    let live = true;
    setState({ data: undefined, error: undefined });
    fn().then(
      (data) => live && setState({ data, error: undefined }),
      (e: unknown) => live && setState({ data: undefined, error: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      live = false;
    };
  }, deps);
  return state;
}

/** Poll `fn` every `ms`, never overlapping two reads. */
export function usePoll<T>(fn: () => Promise<T>, ms: number): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({ data: undefined, error: undefined });
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const data = await fn();
        if (live) setState({ data, error: undefined });
      } catch (e) {
        if (live) setState({ data: undefined, error: e instanceof Error ? e.message : String(e) });
      }
      if (live) timer = setTimeout(tick, ms);
    };
    void tick();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [ms]);
  return state;
}

export function Status<T>({ s, children }: { s: Loaded<T>; children: (d: T) => ReactNode }) {
  if (s.error) return <p className="note bad" role="alert">Could not read: {s.error}</p>;
  if (s.data === undefined) return <p className="note">Reading...</p>;
  return <>{children(s.data)}</>;
}
