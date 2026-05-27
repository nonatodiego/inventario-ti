import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  PanelLeft,
} from "lucide-react";

import { CSSProperties, useState } from "react";

import { useLocation } from "wouter";

import { useIsMobile } from "@/hooks/useMobile";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },

  {
    icon: Users,
    label: "Administração",
    path: "/admin",
  },
];

const DEFAULT_WIDTH = 280;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarWidth] = useState(DEFAULT_WIDTH);

  return (

    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >

      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>

    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {

  const [location, setLocation] = useLocation();

  const isMobile = useIsMobile();

  return (
    <>

      <Sidebar collapsible="icon">

        <SidebarHeader className="h-16 justify-center">

          <div className="flex items-center gap-3 px-2 w-full">

            <button className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg">

              <PanelLeft className="h-4 w-4 text-muted-foreground" />

            </button>

            <span className="font-semibold tracking-tight">
              Inventário TI
            </span>

          </div>

        </SidebarHeader>

        <SidebarContent>

          <SidebarMenu className="px-2 py-1">

            {menuItems.map((item) => {

              const isActive = location === item.path;

              return (

                <SidebarMenuItem key={item.path}>

                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setLocation(item.path)}
                    tooltip={item.label}
                    className="h-10 transition-all font-normal"
                  >

                    <item.icon
                      className={`h-4 w-4 ${
                        isActive ? "text-primary" : ""
                      }`}
                    />

                    <span>{item.label}</span>

                  </SidebarMenuButton>

                </SidebarMenuItem>
              );
            })}

          </SidebarMenu>

        </SidebarContent>

      </Sidebar>

      <SidebarInset>

        {isMobile && (

          <div className="flex border-b h-14 items-center px-2">

            <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />

          </div>

        )}

        <main className="flex-1 p-4">
          {children}
        </main>

      </SidebarInset>

    </>
  );
}