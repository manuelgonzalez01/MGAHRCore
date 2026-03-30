import usePersonnelActionsList from "./usePersonnelActionsList";

export default function usePromotions() {
  return usePersonnelActionsList({ actionType: "promotion" });
}
