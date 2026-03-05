import { Outlet } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import SideBar from "./SideBar";
import AiAuditPanel from "./AiAuditPanel";
// import TopNavBar from "./TopHeader";
import TopHeader from "./TopHeader";

const MainLayout: React.FC = () => {
  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col text-zinc-100 overflow-hidden p-2">
      <TopHeader />
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen w-full rounded-none border-none items-stretch gap-2"
      >
        {/* Left panel Library and folder */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          className="backdrop-blur-xl h-full rounded-xl ">
          <div className="h-full rounded-xl bg-zinc-900/50 overflow-hidden border border-zinc-800/30">
              <SideBar /> 
            </div>
        </ResizablePanel>

        <ResizableHandle className="w-0.5 bg-zinc-800 hover:bg-indigo-500/20 transition-colors" />

        {/* Middle Panel */}
        <ResizablePanel defaultSize={62}>
          <div className="flex flex-col h-full rounded-xl bg-zinc-900 border border-zinc-800/50 overflow-hidden">  
            <main className="flex-1 p-8 pt-2 overflow-y-auto custom-scrollbar max-w-5xl mx-auto w-full">
              <Outlet />
            </main>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-zinc-800 w-1 hover:bg-indigo-500/20 transition-colors" />

        {/* Right Panel */}
        <ResizablePanel defaultSize={20} minSize={0} collapsible={true}>
          <AiAuditPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MainLayout;
