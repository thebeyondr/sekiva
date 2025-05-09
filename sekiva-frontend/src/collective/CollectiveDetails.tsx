import { useParams } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/shared/NavBar";

const OrganizationDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-sk-yellow-light">
      <div className="container mx-auto max-w-[1500px]">
        <NavBar />
        <section className="container mx-auto max-w-3xl py-10">
          <div className="flex flex-col gap-4 bg-white rounded-lg p-10 border-2 border-black">
            <h1 className="text-3xl font-bold">Organization Detail</h1>
            <p className="text-gray-600 break-all">ID: {id}</p>

            <div className="mt-4">
              <Link to={`/collectives/${id}/ballots/new`}>
                <Button className="w-full md:w-auto">Create New Ballot</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrganizationDetail;
