import type { Route } from "./+types/index";
import { Outlet } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Organizations" },
    {
      name: "description",
      content: "Organizations",
    },
  ];
}

export default function Organizations() {
  return (
    <div>
      <h1>Organizations</h1>
      <Outlet />
    </div>
  );
}
