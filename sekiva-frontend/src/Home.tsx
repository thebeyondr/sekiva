import NavBar from "@/components/shared/NavBar";
import bauhausIllustration from "@/assets/bauhaus-illustration.webp";
import { Link } from "react-router";
import { Button } from "./components/ui/button";

function Home() {
  return (
    <div className="h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="flex flex-col xl:flex-row gap-4 py-10">
          <div className="w-[30%] xl:w-[50%] h-full">
            <img
              src={bauhausIllustration}
              alt="Sekiva Illustration"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-[85%] space-y-2">
            <h1 className="text-3xl xl:text-6xl text-center tracking-tighter ">
              Private on-chain ballots for modern collectives
            </h1>
            <p className="text-center text-sm xl:text-base">
              powered by{" "}
              <Link to="https://partisiablockchain.com" target="_blank">
                <Button
                  variant="link"
                  className="p-0 text-blue-600 text-lg tracking-tight font-medium"
                >
                  Partisia Blockchain
                </Button>
              </Link>
            </p>
            <Link to="/collectives/new" className="w-fit mx-auto">
              <Button className="w-fit mx-auto text-lg">
                start collective
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
