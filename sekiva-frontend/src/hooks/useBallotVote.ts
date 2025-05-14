import { useAuth } from "@/auth/useAuth";
import { BallotId } from "@/lib/ballot";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBallotVote(address: BallotId) {
  const { getBallotClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (choice: number) => {
      const client = getBallotClient(address);
      if (!client) throw new Error("Not connected");
      return client.castVote(choice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ballot", address] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
