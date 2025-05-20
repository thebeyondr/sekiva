import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Define the form values interface
export interface CollectiveFormValues {
  name?: string;
  description?: string;
  profileImage?: string;
  bannerImage?: string;
  website?: string;
  x?: string;
  discord?: string;
  members?: { address: string; role: string }[];
}

// A simplified version of CollectiveCard for preview purposes
export default function CollectivePreview({
  formValues = {},
}: {
  formValues?: Partial<CollectiveFormValues>;
}) {
  // Create a preview of the collective from form values
  const previewCollective = {
    id: "preview-id-12345", // Placeholder ID for preview
    name: formValues.name || "Your Collective",
    description:
      formValues.description || "Your collective description will appear here",
    profileImage: formValues.profileImage || "",
    bannerImage: formValues.bannerImage || "",
    memberCount: 1, // Start with just the admin
  };

  // Extract first character safely
  const firstChar = previewCollective.name.charAt(0) || "?";

  return (
    <div className="mt-8">
      <h3 className="text-sm uppercase font-medium tracking-wide text-stone-700 mb-3">
        Preview
      </h3>
      <div className="border-2 border-stone-200 rounded-lg p-3 bg-stone-50">
        <Card className="overflow-hidden relative border-2 border-black rounded-lg h-full max-w-sm mx-auto transform scale-90">
          <div className="h-32">
            {previewCollective.bannerImage ? (
              <img
                src={previewCollective.bannerImage}
                alt={`${previewCollective.name} banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-amber-100 to-sky-100 flex items-center justify-center relative">
                <div className="absolute -right-6 -top-6 w-40 h-40 bg-red-100 rotate-12 z-0"></div>
                <div className="absolute left-1/4 -bottom-4 w-32 h-32 bg-blue-200 z-0"></div>
                <div className="absolute right-1/3 top-1/4 w-24 h-24 rounded-full bg-rose-100 z-0"></div>
              </div>
            )}
          </div>
          <div className="absolute left-6 top-32 -translate-y-1/2 w-14 h-14 border-2 border-black bg-white rounded-full overflow-hidden shadow-md">
            {previewCollective.profileImage ? (
              <img
                src={previewCollective.profileImage}
                alt={`${previewCollective.name} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                <span className="text-xl font-bold text-stone-400">
                  {firstChar}
                </span>
              </div>
            )}
          </div>
          <CardContent className="pt-8 pb-2">
            <h2 className="text-lg font-bold mb-1">{previewCollective.name}</h2>
            <p className="text-stone-600 text-xs line-clamp-2">
              {previewCollective.description}
            </p>
          </CardContent>
          <CardFooter className="pt-2 text-xs text-stone-500 border-t border-stone-100">
            <div className="flex items-center justify-between w-full">
              <span>{previewCollective.memberCount} member</span>
              <span className="text-xs bg-stone-100 px-2 py-1 rounded-full">
                You (Admin)
              </span>
            </div>
          </CardFooter>
        </Card>
        <p className="text-xs text-stone-500 text-center mt-2">
          This is how your collective will appear on the platform
        </p>
      </div>
    </div>
  );
}
