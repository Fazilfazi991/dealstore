export const PRICE_MARKUP_INR=200;
export const calculateSellingPrice=(sourceCost:number)=>{if(!Number.isInteger(sourceCost)||sourceCost<0)throw new Error("INVALID_SOURCE_COST");return sourceCost+PRICE_MARKUP_INR};
