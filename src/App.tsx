import { useState } from "react";
import { LoginHub } from "./components/LoginHub";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { useIsMobile } from "./components/ui/use-mobile";
import { DashboardView } from "./components/DashboardView";
import { CalendarView } from "./components/CalendarView";
import { BudgetManagementView } from "./components/BudgetManagementView";
import { ClubManagementView } from "./components/ClubManagementView";
import { ClubLeaderView } from "./components/ClubLeaderView";
import { JoinClubsView } from "./components/JoinClubsView";
import { ReportView } from "./components/ReportView";
import { FeedbackView } from "./components/FeedbackView";
import { CreateClubsView } from "./components/CreateClubsView";
import { ManageClubOwnersView } from "./components/ManageClubOwnersView";
import { ReportInboxView } from "./components/ReportInboxView";
import { LeaderUserOversightView } from "./components/LeaderUserOversightView";
import { AssignmentCenterView } from "./components/AssignmentCenterView";
import { LeaderAssignmentsView } from "./components/LeaderAssignmentsView";
import { Toaster } from "./components/ui/sonner";

export type UserRole = "member" | "leader" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  clubId?: string;
  clubName?: string;
  avatar?: string;
  email: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isMobile = useIsMobile();

  // Set default view based on role
  const getDefaultView = (role: UserRole) => {
    if (role === "admin") return "create-clubs";
    return "dashboard";
  };

  const [currentView, setCurrentView] = useState<string>(
    currentUser ? getDefaultView(currentUser.role) : "dashboard"
  );

  const handleLogin = (user: User) => {
    console.log("Login triggered:", user);
    setCurrentUser(user);
    const defaultView = getDefaultView(user.role);
    console.log("Setting view to:", defaultView);
    setCurrentView(defaultView);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("dashboard");
  };

  if (!currentUser) {
    return <LoginHub onLogin={handleLogin} />;
  }

  const renderView = () => {
    console.log("Rendering view:", currentView, "for role:", currentUser.role);
    // Admin views
    if (currentUser.role === "admin") {
      switch (currentView) {
        case "create-clubs":
          console.log("Rendering CreateClubsView");
          return <CreateClubsView user={currentUser} />;
        case "manage-owners":
          return <ManageClubOwnersView user={currentUser} />;
        case "report-inbox":
          return <ReportInboxView user={currentUser} />;
        case "user-oversight":
          return <LeaderUserOversightView user={currentUser} />;
        case "assignments":
          return <AssignmentCenterView user={currentUser} />;
        default:
          console.log("Default case - Rendering CreateClubsView");
          return <CreateClubsView user={currentUser} />;
      }
    }

    // Leader and Member views
    switch (currentView) {
      case "dashboard":
        return <DashboardView user={currentUser} />;
      case "calendar":
        return <CalendarView user={currentUser} />;
      case "budget":
        return <BudgetManagementView user={currentUser} />;
      case "report-inbox":
        if (currentUser.role === "leader" || currentUser.role === "admin") {
          return <ReportInboxView user={currentUser} />;
        }
        return <DashboardView user={currentUser} />;
      case "clubs":
        if (currentUser.role === "leader") {
          return <ClubLeaderView user={currentUser} />;
        } else {
          return <JoinClubsView user={currentUser} />;
        }
      case "assignments":
        if (currentUser.role === "leader") {
          return <LeaderAssignmentsView user={currentUser} />;
        }
        return <DashboardView user={currentUser} />;
      case "report":
        return <ReportView user={currentUser} />;
      case "feedback":
        return <FeedbackView user={currentUser} />;
      default:
        return <DashboardView user={currentUser} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          user={currentUser}
          onLogout={handleLogout}
        />
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50" 
          style={{ paddingLeft: isMobile ? '3rem' : '0', minWidth: 0 }}
        >
          {renderView() || <div className="p-8"><h1>No view rendered</h1></div>}
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
