import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
