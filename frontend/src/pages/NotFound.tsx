import { Link } from 'react-router-dom';
import { FileQuestion, Home, ChevronLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] dark:bg-[#0B0E14] light:bg-slate-50 transition-colors duration-300 p-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Animated Icon Container */}
        <div className="flex justify-center">
          <div className="relative p-6 bg-[#161B22] border border-white/5 rounded-3xl shadow-2xl">
            <FileQuestion size={80} className="text-blue-500 animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              MISSING
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-6xl font-black text-white dark:text-white light:text-slate-900 tracking-tighter">
            404
          </h1>
          <h2 className="text-xl font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">
            Note Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-500 light:text-slate-500 text-sm leading-relaxed">
            The idea you're looking for seems to have vanished into the digital void. Maybe it was never written, or perhaps it moved to a new folder?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <Home size={18} />
            Back to All Notes
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#161B22] hover:bg-[#1C2128] text-slate-300 border border-white/10 font-medium rounded-xl transition-all"
          >
            <ChevronLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;