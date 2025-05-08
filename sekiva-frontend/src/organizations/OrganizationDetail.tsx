import { useParams } from "react-router";

const OrganizationDetail = () => {
  const { id } = useParams();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sk-yellow-light">
      <h1 className="text-3xl font-bold">Organization Detail</h1>
      <p>{id}</p>
    </div>
  );
};

export default OrganizationDetail;
