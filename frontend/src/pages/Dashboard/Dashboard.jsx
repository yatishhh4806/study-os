import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DashboardHome from "./DashboardHome";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#09070f]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Topbar />
        <DashboardHome />
      </div>
    </div>
  );
}

export default Dashboard;