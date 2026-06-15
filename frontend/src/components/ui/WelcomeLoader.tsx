import { useEffect, useState } from "react";

const WelcomeLoader = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const lastUserName = localStorage.getItem("lastUserName");
    if (lastUserName) {
      // Get just the first name
      setName(lastUserName.split(" ")[0]);
    }
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#121212]">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-1000 slide-in-from-bottom-4">
        <h1 className="text-2xl font-medium tracking-tight text-white/90 sm:text-3xl">
          Welcome{name ? `, ${name}` : ""}
          <span className="inline-flex animate-pulse tracking-widest ml-1">...</span>
        </h1>
      </div>
    </div>
  );
};

export default WelcomeLoader;
