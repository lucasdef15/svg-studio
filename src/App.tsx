import PathEditor from "./components/PathEditor";
import Sidebar from "./components/sidebar";

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1e24] text-gray-200">
      <PathEditor />
      <Sidebar />
    </div>
  );
}

export default App;
