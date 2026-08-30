import { z } from "zod";

const text = (label:string, max:number) => z.string().trim().min(2, `${label} is required.`).max(max, `${label} is too long.`);
export const checkoutSchema = z.object({
  full_name:text("Full name",100),
  phone:z.string().transform(value=>value.replace(/\D/g,"").replace(/^91(?=[6-9]\d{9}$)/,""))
    .refine(value=>/^[6-9]\d{9}$/.test(value),"Enter a valid 10-digit Indian mobile number."),
  email:z.string().trim().max(254).email("Enter a valid email address.").optional().or(z.literal("")),
  address_line_1:text("House / flat and street",200), address_line_2:z.string().trim().max(200).optional(),
  locality:text("Locality",100), landmark:z.string().trim().max(100).optional(), city:text("City",100),
  state:text("State",100), postal_code:z.string().trim().regex(/^\d{6}$/,"Enter a valid 6-digit PIN code."),
  country:z.literal("India").default("India"),
});
export const cartSchema = z.array(z.object({ sku:z.string().trim().regex(/^[A-Z0-9-]{5,40}$/), quantity:z.number().int().min(1).max(10) })).min(1).max(25);
export const checkoutRequestSchema = z.object({ checkout:checkoutSchema, items:cartSchema, paymentMethod:z.enum(["cod","stripe"]), idempotencyKey:z.string().uuid() });
export const variantSku=(productId:string,size:string)=>`${productId}-${size.toUpperCase().replace(/[^A-Z0-9]/g,"")}`;
