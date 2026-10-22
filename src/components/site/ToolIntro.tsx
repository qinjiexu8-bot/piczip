type ToolIntroProps = {
  title: string;
  description: string;
};

/** Keep introductions focused on the task; privacy details live in the footer and FAQ. */
export function ToolIntro({ title, description }: ToolIntroProps) {
  return (
    <section className="tool-intro">
      <div className="tool-intro-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
