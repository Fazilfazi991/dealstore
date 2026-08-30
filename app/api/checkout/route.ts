import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/lib/commerce/validation";
import { abandonStripeOrder, attachStripeSession, createOrder } from "@/lib/commerce/repository.server";
import { createStripeCheckout, stripeConfigured } from "@/lib/commerce/stripe.server";

export const runtime="nodejs";
export async function POST(request:Request){
  try{
    const parsed=checkoutRequestSchema.safeParse(await request.json());
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Check your order details and try again."},{status:400});
    const {checkout,items,paymentMethod,idempotencyKey}=parsed.data;
    if(paymentMethod==="stripe"&&!stripeConfigured())return NextResponse.json({error:"Online payment is temporarily unavailable. Choose Cash on Delivery."},{status:503});
    const order=await createOrder(checkout,items,paymentMethod,idempotencyKey);
    if(order.duplicate)return NextResponse.json({error:"This order was already submitted. Check your latest confirmation before trying again."},{status:409});
    const response=NextResponse.json({orderNumber:order.order_number,total:order.total,redirectUrl:null as string|null});
    response.cookies.set("dealstore_order_access",`${order.order_number}.${order.access_token}`,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/order-success",maxAge:60*60*24*30});
    if(paymentMethod==="stripe"){
      let session;try{session=await createStripeCheckout(order,checkout,items)}catch(error){await abandonStripeOrder(order.order_number);throw error}await attachStripeSession(order.order_number,session.id,session.payment_intent);
      return NextResponse.json({orderNumber:order.order_number,total:order.total,redirectUrl:session.url},{headers:{"Set-Cookie":response.headers.get("Set-Cookie")||""}});
    }
    return response;
  }catch(error){
    const code=error instanceof Error?error.message:"UNKNOWN";
    const stock=code.includes("VARIANT_UNAVAILABLE")||code.includes("INSUFFICIENT_STOCK");
    const unconfigured=code.includes("COMMERCE_NOT_CONFIGURED");
    console.error("checkout_failed",{code});
    return NextResponse.json({error:stock?"One of your selected sizes is no longer available. Return to your bag and update it.":unconfigured?"Checkout is being configured. Please try again shortly.":"We couldn’t place your order. Your bag is unchanged; please try again."},{status:stock?409:unconfigured?503:500});
  }
}
