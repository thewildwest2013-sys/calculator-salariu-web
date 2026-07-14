"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/lib/ui-context";
export default function WorkspaceTabs(){const path=usePathname();const{language}=useUI();const ro=language==="ro";const tabs=[["/dashboard",ro?"Prezentare":"Overview"],["/profiles",ro?"Profiluri":"Profiles"],["/company",ro?"Companie":"Company"],["/company/employees",ro?"Angajați":"Employees"],["/settings",ro?"Setări":"Settings"],["/pricing",ro?"Plan și plăți":"Plan & billing"],["/security",ro?"Securitate":"Security"]] as const;return <nav className="platform-tabs" aria-label="Workspace">{tabs.map(([href,label])=><Link key={href} href={href} className={path===href?"active":""}>{label}</Link>)}</nav>}
