import {useQuery} from "@tanstack/react-query";
import {knownAddresses} from "../../constants";

export function useGetVerifiedAddresses() {
  return useQuery<Record<string, string>>({
    queryKey: ["verified_addresses"],
    placeholderData: knownAddresses,
    refetchOnMount: true,
    queryFn: async () => {
      console.log("fetching verified addresses");
      let res;
      try {
        // TODO: Replace with the actual URL for verified addresses
        res = await fetch(
          "https://raw.githubusercontent.com/chiumax/nightly-sandbox/refs/heads/main/addr.json",
        );
      } catch (error) {
        console.error("Failed to fetch verified addresses:", error);
        return knownAddresses;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch verified addresses");
      }

      const addresses: Record<string, string> = await res.json();
      console.log("addresses", addresses);
      return {
        ...knownAddresses,
        ...addresses,
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
