import type { ReactNode } from "react"; import { AppShell } from "@/components/app-shell"; import { getSessionContext } from "@/lib/workspace";
export default async function Layout({children}:{children:ReactNode}){const {workspace}=await getSessionContext();return <AppShell workspaceName={workspace.name}>{children}</AppShell>}
