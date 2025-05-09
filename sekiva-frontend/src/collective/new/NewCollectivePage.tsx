import NavBar from "@/components/shared/NavBar";
import sekivaLogo from "@/assets/sekiva-logo-lg.webp";
import { FormSteps } from "./FormSteps";

function NewCollectivePage() {
  return (
    <div className="min-h-screen bg-sk-yellow-saturated">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="container mx-auto max-w-3xl py-10">
          <div className="relative flex flex-col gap-4 bg-white rounded-lg p-10 border-2 border-black overflow-clip">
            <div className="absolute bottom-32 -left-1/6 w-1/3 h-auto">
              <img
                src={sekivaLogo}
                alt="Sekiva Logo"
                className="w-full h-full"
              />
            </div>
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
              <div className="col-span-9 min-h-[500px]">
                <section className="flex flex-col gap-4 max-w-md">
                  <FormSteps />
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NewCollectivePage;
