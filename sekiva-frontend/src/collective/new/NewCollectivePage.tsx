import NavBar from "@/components/shared/NavBar";
import sekivaLogo from "@/assets/sekiva-logo-lg.webp";
import { FormSteps } from "./FormSteps";
import { ClipboardList, Users } from "lucide-react";
import { useState } from "react";

function StepIndicator({
  title,
  icon,
  isActive,
}: {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 py-2">
      <div
        className={`p-1.5 rounded-full ${
          isActive ? "bg-black text-white" : "bg-stone-100 text-stone-400"
        }`}
      >
        {icon}
      </div>
      <h2
        className={`text-base font-medium ${
          isActive ? "text-black" : "text-stone-400"
        }`}
      >
        {title}
      </h2>
    </li>
  );
}

type StepType = "define" | "members";

function NewCollectivePage() {
  // Track active step through local state
  const [activeStep, setActiveStep] = useState<StepType>("define");

  // Handler for step changes
  const handleStepChange = (step: StepType) => {
    setActiveStep(step);
  };

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
                <ul className="w-full space-y-1">
                  <StepIndicator
                    title="DEFINE"
                    icon={<ClipboardList size={16} />}
                    isActive={activeStep === "define"}
                  />
                  <StepIndicator
                    title="MEMBERS"
                    icon={<Users size={16} />}
                    isActive={activeStep === "members"}
                  />
                </ul>
              </div>
              <div className="col-span-9 min-h-[500px]">
                <section className="flex flex-col gap-4 max-w-md">
                  <FormSteps onStepChange={handleStepChange} />
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
