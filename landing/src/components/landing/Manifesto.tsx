import { FadeIn } from '../ui/FadeIn';

export const Manifesto = () => {
  const lines = [
    { lead: "You take notes to remember.", tail: "But you forget where you put them." },
    { lead: "You want to think clearly.", tail: "So you open six different apps." },
    { lead: "You don't need more features.", tail: "You need fewer decisions." },
  ];

  return (
    <section className="relative py-32 z-20">
      <div className="container mx-auto px-6 max-w-3xl space-y-16 text-center sm:text-left">
        {lines.map((line, i) => (
          <FadeIn key={i} delay={i * 200}>
            <p className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {line.lead} <span className="text-stone-500">{line.tail}</span>
            </p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
