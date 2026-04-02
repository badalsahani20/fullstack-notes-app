import SignupForm from "@/components/signup/SignupForm";
import NewUsersShowcase from "@/components/signup/NewUsersShowcase";
import illustration from "@/components/signup/illustrations/dark.png";

const Register = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background lg:flex lg:bg-black">
      {/* Immersive Background Image (Desktop Only) */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <img 
          src={illustration} 
          alt="" 
          className="h-full w-full object-cover opacity-90 brightness-[85%] contrast-[105%]" 
        />
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* Unified Content Overlay */}
      <div className="relative z-10 flex h-full w-full flex-col lg:flex-row">
        
        {/* Left Section: Scrollable Form Container */}
        <div className="flex h-full w-full flex-col overflow-y-auto lg:w-[600px] xl:w-[700px]">
          <div className="flex min-h-full items-center justify-start px-6 py-12 [@media(max-height:800px)]:py-8 lg:px-20 xl:px-32">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-left-8 duration-700">
              <SignupForm />
            </div>
          </div>
        </div>

        {/* Right Section: Showcase & Branding */}
        <div className="relative hidden flex-1 flex-col justify-end p-6 lg:flex xl:p-8">
          <div className="mb-6 self-end transition-all duration-700">
            <NewUsersShowcase />
          </div>
          
          <div className="text-right opacity-40 hover:opacity-100 transition-opacity duration-700">
             <div className="ml-auto h-px w-10 bg-indigo-500/50" />
             <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-white/40">Powered by Gemini AI</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;


