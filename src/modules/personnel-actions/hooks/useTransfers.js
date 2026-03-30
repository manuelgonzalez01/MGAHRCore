import usePersonnelActionsList from "./usePersonnelActionsList";

export default function useTransfers() {
  return usePersonnelActionsList({ actionType: "transfer" });
}
