import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Wand2,
  Sparkles,
  Library,
  LayoutTemplate,
  FlaskConical,
  Gauge,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/components/language-provider";

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { title: t.nav.home, url: "/", icon: Home, key: "home" },
    { title: t.nav.generator, url: "/generator", icon: Wand2, key: "generator" },
    { title: t.nav.improver, url: "/improver", icon: Sparkles, key: "improver" },
    { title: t.nav.library, url: "/library", icon: Library, key: "library" },
    { title: t.nav.templates, url: "/templates", icon: LayoutTemplate, key: "templates" },
    { title: t.nav.sandbox, url: "/sandbox", icon: FlaskConical, key: "sandbox" },
    { title: t.nav.scoring, url: "/scoring", icon: Gauge, key: "scoring" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight" data-testid="text-app-title">
              PromptForge
            </h1>
            <p className="text-xs text-muted-foreground">{t.appSubtitle}</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.nav.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link
                      href={item.url}
                      data-testid={`link-nav-${item.key}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground">PromptForge v1.0</p>
      </SidebarFooter>
    </Sidebar>
  );
}
