import { ArrowLeft, ArrowRight, House, Search } from "lucide-react"
import { Input } from "./ui/input"
import SideBarHeader from "./SideBarHeader";

const TopHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-black h-16 w-full">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <button title="arrow-left" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <button title="arrow-right" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl flex items-center gap-2">
        <button title="home" className="p-3 bg-zinc-800 rounded-full text-white hover:scale-105 transition-transform">
          <House size={24}/>
        </button>

        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-white transition-colors" />
          <Input 
              placeholder="Find your thoughts..."
              className="pl-12 h-12 bg-zinc-900 border-none rounded-full focus-visible:ring-1 focus-visible:ring-zinc-700 placeholder:text-zinc-300 text-sm w-full"
              />
        </div>
      </div>
      <div className="flex items-center gap-4 min-w-[200px] justify-end">
        {/* <button className="hidden md:block px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform">
          Explore Premium
        </button> */}
        <SideBarHeader />
      </div>
    </div>
  )
}

export default TopHeader;