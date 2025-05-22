import NavBar from "@/components/shared/NavBar";
import bauhausIllustration from "@/assets/bauhaus-illustration.webp";
import { Link } from "react-router";
import { Button } from "./components/ui/button";
import { LayoutGrid, Plus } from "lucide-react";
import { WelcomeDialog } from "./components/shared/WelcomeDialog";

function Home() {
  return (
    <div className="h-screen bg-sk-yellow-light overflow-auto">
      <WelcomeDialog />
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="flex flex-col-reverse xl:flex-row gap-4 py-10">
          <div className="w-full xl:w-[50%] h-full">
            <img
              src={bauhausIllustration}
              alt="Sekiva Illustration"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center items-start md:items-center space-y-3 px-4">
            <h1 className="text-4xl xl:text-6xl font-medium tracking-[-0.04em] max-w-2xl text-left md:text-center">
              Private on-chain ballots for modern collectives
            </h1>
            <p className="text-lg max-w-xl text-left md:text-center">
              Build decentralized organizations with secure private voting on{" "}
              <Link
                to="https://partisiablockchain.com"
                target="_blank"
                className="text-blue-600 font-medium hover:underline"
              >
                Partisia Blockchain
              </Link>
            </p>

            <div className="flex flex-wrap space-x-2 justify-start md:justify-center">
              <Link to="/collectives">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 border-2 border-black"
                >
                  <LayoutGrid className="w-5 h-5" />
                  View Collectives
                </Button>
              </Link>

              <Link to="/collectives/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Start Collective
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
