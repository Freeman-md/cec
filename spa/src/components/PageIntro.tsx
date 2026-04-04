import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  summary: string;
  actions?: ReactNode;
};

export function PageIntro({ eyebrow, title, summary, actions }: PageIntroProps) {
  return (
    <section className="surface-card surface-card--hero">
      <p className="eyebrow">{eyebrow}</p>
      <div className="page-intro">
        <div>
          <h1 className="title is-1">{title}</h1>
          <p className="subtitle is-5">{summary}</p>
        </div>
        {actions ? <div className="page-intro__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
