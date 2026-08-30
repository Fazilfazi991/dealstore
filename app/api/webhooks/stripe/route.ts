import { applyStripeEvent } from "@/lib/commerce/repository.server";
import { verifyStripeSignature } from "@/lib/commerce/stripe.server";
export const runtime="nodejs";
export async function POST(request:Request){
  const body=await request.text(); const signature=request.headers.get("stripe-signature")||""; const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!secret||!verifyStripeSignature(body,signature,secret))return new Response("Invalid signature",{status:400});
  const event=JSON.parse(body) as {id:string;type:string;data:{object:{id?:string;payment_intent?:string}}};
  if(!["checkout.session.completed","payment_intent.payment_failed","charge.refunded"].includes(event.type))return Response.json({received:true,ignored:true});const object=event.data.object;
  await applyStripeEvent(event.id,event.type,event.type.startsWith("checkout.session")?object.id||"":"",object.payment_intent||object.id||"");
  return Response.json({received:true});
}
