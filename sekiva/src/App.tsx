import { Button } from "./components/ui/button";

function App() {
  return (
    <main className="font-sans h-screen">
      <section className="flex flex-col xl:flex-row w-full h-full">
        <section className="w-full xl:w-1/2 p-5 bg-yellow-300 flex justify-center items-center">
          <div className="flex flex-col gap-2">
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
            <section>
              <Button
                className="w-fit text-sm xl:text-lg"
                variant={"default"}
                size={"lg"}
              >
                Create your first organization
              </Button>
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
          </div>
        </section>
        <section className="w-full xl:w-1/2 bg-blue-100 p-4 h-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium tracking-tighter">
              Create a new organization
            </h1>
            <p className="text-sm font-medium tracking-tight pt-1">
              Create a new organization to start voting. You can create a new
              organization by clicking the button above.
            </p>

            <h2 className="text-xl font-medium tracking-tighter">Actions</h2>
            <section className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <Button
                  variant={"default"}
                  size={"lg"}
                  className="cursor-pointer"
                >
                  Create a new organization
                </Button>
              </div>
              <div className="flex flex-col gap-2 p-2 border border-stone-600 rounded-md">
                <form className="flex flex-col gap-2">
                  <input
                    type="text"
                    id="ballot-title"
                    placeholder="ballot title"
                    className="w-full p-2 rounded-md border border-stone-300"
                  />
                  <input
                    type="text"
                    id="ballot-description"
                    placeholder="ballot description"
                    className="w-full p-2 rounded-md border border-stone-300"
                  />
                  <input
                    type="text"
                    id="ballot-option-1"
                    placeholder="ballot option 1"
                    className="w-full p-2 rounded-md border border-stone-300"
                  />
                  <input
                    type="text"
                    id="ballot-option-2"
                    placeholder="ballot option 2"
                    className="w-full p-2 rounded-md border border-stone-300"
                  />
                  <input
                    type="text"
                    id="ballot-option-3"
                    placeholder="ballot option 3"
                    className="w-full p-2 rounded-md border border-stone-300"
                  />
                </form>
                <Button
                  variant={"default"}
                  size={"lg"}
                  className="cursor-pointer"
                >
                  Create a new ballot
                </Button>
              </div>
              <Button
                variant={"default"}
                size={"lg"}
                className="cursor-pointer"
              >
                Set ballot active
              </Button>
              <Button
                variant={"default"}
                size={"lg"}
                className="cursor-pointer"
              >
                Cast vote
              </Button>
              <Button
                variant={"default"}
                size={"lg"}
                className="cursor-pointer"
              >
                Compute tally
              </Button>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
