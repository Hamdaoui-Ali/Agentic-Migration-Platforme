import type { Metadata } from "next";
import { AngularControlTowerPage } from "@/stacks/angular/components/angular-control-tower-page";

export const metadata: Metadata = { title: "Angular Migration Workspace" };

export default function Page() {
  return <AngularControlTowerPage />;
}
