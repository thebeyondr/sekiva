import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sekiva" },
    {
      name: "description",
      content: "Secure voting for blockchain native organizations.",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
