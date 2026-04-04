import type { ReactNode } from "react";

type PageFrameProps = {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function PageFrame({ header, children, footer }: PageFrameProps) {
  return (
    <main className="app-shell">
      <div className="app-shell__content">
        {header}
        <div className="page-container">{children}</div>
        {footer}
      </div>
    </main>
  );
}
