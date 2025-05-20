import { NavLink } from "react-router";
import ConnectButton from "@/components/shared/ConnectButton";

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center p-4 border-b border-black">
      <NavLink to="/" className="flex items-center space-x-1">
        <img src="/favicon.svg" alt="Sekiva" className="w-10 h-10" />
        <p className="text-2xl font-medium tracking-[-0.075rem]">sekiva</p>
      </NavLink>
      <ConnectButton />
    </nav>
  );
};

export default NavBar;
