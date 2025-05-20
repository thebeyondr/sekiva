import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router";
import type { CollectiveCardData } from "./MyCollectives";

const CollectiveCard = ({ collective }: { collective: CollectiveCardData }) => (
  <Link key={collective.id} to={`/collectives/${collective.id}`}>
    <Card className="overflow-hidden relative border-2 border-black rounded-lg hover:translate-y-[-4px] transition-all cursor-pointer h-full">
      <div className="h-40">
        {collective.bannerImage ? (
          <img
            src={collective.bannerImage}
            alt={`${collective.name} banner`}
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
      <div className="absolute left-6 top-40 -translate-y-1/2 w-16 h-16 border-2 border-black bg-white rounded-full overflow-hidden shadow-md">
        {collective.profileImage ? (
          <img
            src={collective.profileImage}
            alt={`${collective.name} profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-400">
              {collective.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <CardContent className="pt-12 pb-4">
        <h2 className="text-xl font-bold mb-2">{collective.name}</h2>
        <p className="text-gray-600 text-sm line-clamp-2">
          {collective.description}
        </p>
      </CardContent>
      <CardFooter className="pt-4 text-sm text-gray-500 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <span>{collective.memberCount} members</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{`~${collective.id.substring(0, 4)}...${collective.id.substring(
            collective.id.length - 5
          )}`}</span>
        </div>
      </CardFooter>
    </Card>
  </Link>
);

export default CollectiveCard;
