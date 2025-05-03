import OrganizationsHome from "~/organizations/Home";
import type { Route } from "./+types/index";

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
  return <OrganizationsHome />;
}
