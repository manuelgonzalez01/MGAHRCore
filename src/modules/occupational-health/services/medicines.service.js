import { getOccupationalHealthDomain } from "./occupationalHealthDomain.service";
export { saveConditionRecord, saveMedicineRecord } from "./occupationalHealthDomain.service";

export async function getMedicinesWorkspace(filters = {}) {
  const domain = await getOccupationalHealthDomain(filters);
  return {
    items: domain.filtered.medicines,
    options: domain.options,
    conditions: domain.filtered.conditions,
  };
}
