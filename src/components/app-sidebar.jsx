"use client"
import { useContext } from 'react';
import { GlobalContext } from '@/context/GlobalContextProvider';
import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "UTM Links",
      url: "/utm-links",
      icon: IconListDetails,
    }
  ]
}

export function AppSidebar({
  ...props
}) {


  const { siteInfo } = useContext(GlobalContext);


  return (
    <Sidebar collapsible="offcanvas" {...props}>
      
      
      
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <div className="h-4 w-[14px] bg-[#fbcd1d] rounded-tl-full rounded-bl-full"></div>
                {/* <IconInnerShadowTop className="!size-5 text-green-600" /> */}
                {/* <img src="/images/small-logo.png"   alt="Vill Fields" className="w-6 h-6" /> */}
                <span className="text-base font-semibold">{siteInfo?.name}.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>



      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>



      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
