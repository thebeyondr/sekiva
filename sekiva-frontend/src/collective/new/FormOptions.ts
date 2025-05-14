import { OrganizationInfo } from "@/contracts/factory/SekivaFactoryGenerated";
import { formOptions } from "@tanstack/react-form";

type Member = {
  address: string;
  role: string;
};

export const membersCheck = (members: Member[]) => {
  let error = "";
  const filteredMembers = members.filter((member) => member.address !== "");
  if (filteredMembers.length === 0) error = "Please add member addresses";
  return error;
};

// set form data for testing
const formData = {
  name: "NUMA",
  description: "NUMA is a collective of 1000+ members",
  profileImage:
    "https://i.pinimg.com/736x/44/16/28/441628a7408e06d59c00502070792f9d.jpg",
  bannerImage:
    "https://i.pinimg.com/originals/ca/c4/ad/cac4adab2a68c7f824ecc07764e9e30f.gif",
  x: "https://x.com/numa_collective",
  discord: "https://discord.gg/numa",
  website: "https://numa.xyz",
  members: [
    {
      address: "0x1234567890123456789012345678901234567890",
      role: "Admin",
    },
  ],
};
export const collectiveFormOpts = formOptions({
  defaultValues: formData,
});
