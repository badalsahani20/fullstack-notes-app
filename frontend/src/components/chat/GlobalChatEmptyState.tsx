import { useAuthStore } from "@/store/useAuthStore";

const getGreeting = (name: string) => {
  const hr = new Date().getHours();
  const commaName = name ? `, ${name}` : "";
  
  if (hr >= 5 && hr < 12) {
    return `What are we learning today${commaName}?`;
  }
  if (hr >= 12 && hr < 17) {
    return `Turn confusion into clarity${name ? `, ${name}` : ""}.`;
  }
  if (hr >= 17 && hr < 22) {
    return `Let's build your understanding${name ? `, ${name}` : ""}.`;
  }
  return `Ready to study smarter tonight${commaName}?`;
};

export const GlobalChatEmptyState = ({
  onChipClick,
  prompts,
}: {
  onChipClick: (text: string) => void;
  prompts: { students: string[]; devs: string[] };
}) => {
  const { user } = useAuthStore();
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const greeting = getGreeting(firstName);

  const studentList = prompts?.students?.length ? prompts.students : ["Quick crash course on any subject", "Help me improve my writing clarity"];
  const devList = prompts?.devs?.length ? prompts.devs : ["Break down a complex concept", "How does authentication actually work?"];

  // Take prime actionable prompts to display statically
  const promptCards = [
    { text: studentList[0], category: "🎓 Study & Learn" },
    { text: studentList[1] || studentList[0], category: "📝 Writing & Prep" },
    { text: devList[0], category: "💡 Solve & Explain" },
    { text: devList[1] || devList[0], category: "💻 Code & Build" },
  ];

  return (
    <div className="gc-empty select-none">
      <div className="gc-empty-copy">
        <h2 className="gc-empty-title flex items-center justify-center gap-3 font-semibold text-3xl md:text-4xl tracking-tight select-none">
          <div className="iris-logo-inline flex items-center justify-center" style={{ width: "2.4rem", height: "2.4rem" }}>
            <div className="iris-orb" style={{ width: "2rem", height: "2rem" }} />
          </div>
          <span>{greeting}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[46rem] mt-6 px-4">
        {promptCards.map((card) => (
          <button
            key={card.text}
            type="button"
            className="flex flex-col items-start text-left p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.035)] hover:bg-[rgba(255,255,255,0.065)] hover:border-[rgba(255,255,255,0.14)] transition-all duration-200"
            onClick={() => onChipClick(card.text)}
          >
            <span className="text-[10px] uppercase tracking-wider text-[var(--primary-color)] opacity-85 mb-1.5 font-bold">
              {card.category}
            </span>
            <span className="text-[0.875rem] text-[var(--text-strong)] opacity-95 font-medium leading-relaxed">
              {card.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
