import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function Welcome() {
  return (
    <main className="flex items-center justify-center h-screen">
      <section className="flex justify-center items-center w-full h-full bg-yellow-300">
        <section className="w-full xl:w-1/2 p-5 flex-col justify-center items-center text-center">
          <h1 className="text-4xl xl:text-6xl font-medium tracking-tighter">
            Secure voting for blockchain native organizations.
          </h1>
          <p className="text-lg font-medium tracking-tight pt-1">
            <span className="text-stone-600">powered by</span>{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://partisiablockchain.com/"
              className="text-black underline"
            >
              Partisia Blockchain
            </a>
          </p>
          <section className="flex flex-col gap-2 items-center">
            <Link to="/organizations/new	">
              <Button
                className="w-fit text-sm xl:text-lg"
                variant={"default"}
                size={"lg"}
              >
                Create your first organization
              </Button>
            </Link>
            <p className="text-sm xl:text-lg font-medium tracking-tight pt-2">
              <span className="text-stone-600">Already have an account?</span>{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://partisiablockchain.com/"
                className="text-black underline"
              >
                Sign in
              </a>
            </p>
          </section>
        </section>
      </section>
    </main>
  );
}
