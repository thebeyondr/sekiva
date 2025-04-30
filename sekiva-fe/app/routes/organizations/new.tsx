import type { Route } from "./+types/new";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Organization" },
    {
      name: "description",
      content: "New Organization",
    },
  ];
}

export default function NewOrganization() {
  return <div>New Organization</div>;
}
