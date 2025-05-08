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

export const collectiveFormOpts = formOptions({
  defaultValues: {
    name: "",
    description: "",
    members: [] as Member[],
    profileImage: "",
    bannerImage: "",
    website: "",
    x: "",
    discord: "",
  },
});
