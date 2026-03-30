import { Outlet } from "react-router-dom";
import Sidebar from "../../components/navigation/Sidebar";
import "../../assets/styles/globals.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
