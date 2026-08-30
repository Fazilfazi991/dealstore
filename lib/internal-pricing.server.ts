import "server-only";
import { calculateSellingPrice } from "@/lib/commerce/pricing";
export const sourceCostsBySku:Record<string,number>={"MSH-ETH-001":494,"MSH-ETH-002":409,"MSH-SET-003":475,"MSH-SET-004":616,"MSH-GWN-005":632,"MSH-GWN-006":490,"MSH-WES-007":667,"MSH-WES-008":479,"MSH-WES-009":558,"MSH-WES-010":637};
export const sellingPriceFor=(sku:string)=>calculateSellingPrice(sourceCostsBySku[sku]);
