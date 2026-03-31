import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertDecision } from "@shared/routes";

export function useDecisions() {
  return useQuery({
    queryKey: [api.decisions.list.path],
    queryFn: async () => {
      const res = await fetch(api.decisions.list.path);
      if (!res.ok) throw new Error("Failed to fetch decisions");
      return api.decisions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDecision) => {
      const validated = api.decisions.create.input.parse(data);
      const res = await fetch(api.decisions.create.path, {
        method: api.decisions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.decisions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to consult the board");
      }
      return api.decisions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.decisions.list.path] });
    },
  });
}
