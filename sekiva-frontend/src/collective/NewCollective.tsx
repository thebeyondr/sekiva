import NavBar from "@/components/shared/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";

function NewCollective() {
  return (
    <div className="h-screen bg-sk-yellow-saturated">
      <div className="container mx-auto max-w-[80vw]">
        <NavBar />
        <section className="container mx-auto max-w-3xl py-12">
          <div className="flex flex-col gap-4 bg-white rounded-lg p-10 border-2 border-black">
            <section className="grid grid-cols-12 gap-4">
              <div className="flex col-span-3">
                <ul>
                  <li>
                    <h2 className="text-lg font-bold">DEFINE</h2>
                  </li>
                  <li>
                    <h2 className="text-lg font-bold">MEMBERS</h2>
                  </li>
                </ul>
              </div>
              <div className="col-span-9">
                <h1 className="text-2xl xl:text-4xl font-normal tracking-tighter py-3">
                  Define your collective.
                </h1>
                <section className="flex flex-col gap-4 max-w-md">
                  <form className="flex flex-col space-y-6">
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700"
                        htmlFor="collective-name"
                      >
                        Collective name
                      </Label>
                      <Input
                        id="collective-name"
                        placeholder="ACME"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700"
                        htmlFor="collective-description"
                      >
                        Collective description
                      </Label>
                      <Textarea
                        id="collective-description"
                        placeholder="What is your mission?"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700"
                        htmlFor="collective-logo"
                      >
                        Paste collective logo URL
                      </Label>
                      <Input
                        id="collective-logo"
                        placeholder="https://example.com/logo.png"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700"
                        htmlFor="collective-banner"
                      >
                        Paste collective banner URL
                      </Label>
                      <Input
                        id="collective-banner"
                        placeholder="https://example.com/banner.png"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700"
                        htmlFor="collective-x"
                      >
                        Paste collective X URL
                      </Label>
                      <Input
                        id="collective-x"
                        placeholder="https://x.com/collective"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700"
                        htmlFor="collective-discord"
                      >
                        Paste collective Discord URL
                      </Label>
                      <Input
                        id="collective-discord"
                        placeholder="https://discord.com/collective"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                    <div className="flex flex-col gap-1 group">
                      <Label
                        className="text-sm uppercase font-medium tracking-wide text-stone-700 group-focus-visible:text-black"
                        htmlFor="collective-website"
                      >
                        Paste collective website URL
                      </Label>
                      <Input
                        id="collective-website"
                        placeholder="https://collective.com"
                        className="shadow-none border-black/60 rounded-sm focus-visible:ring-2 focus-visible:ring-black/90"
                      />
                    </div>
                  </form>
                  <Button className="w-full">next: add members</Button>
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NewCollective;
