export interface CollectiveFormValues {
  name: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  website: string;
  x: string;
  discord: string;
  members: Member[];
}

export interface Member {
  address: string;
  role: string;
}
