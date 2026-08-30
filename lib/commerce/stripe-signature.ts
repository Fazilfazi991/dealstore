import { createHmac, timingSafeEqual } from "node:crypto";
export function verifyStripeSignature(body:string,header:string,secret:string,now=Math.floor(Date.now()/1000)){
  const parts=header.split(",").map(part=>part.split("="));const timestamp=Number(parts.find(([key])=>key==="t")?.[1]);const signatures=parts.filter(([key])=>key==="v1").map(([,value])=>value);if(!timestamp||Math.abs(now-timestamp)>300)return false;const expected=createHmac("sha256",secret).update(`${timestamp}.${body}`).digest("hex");return signatures.some(signature=>signature.length===expected.length&&timingSafeEqual(Buffer.from(signature),Buffer.from(expected)));
}
