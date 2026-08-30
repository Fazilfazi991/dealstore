export type PaymentMethod = "cod" | "stripe";
export type CheckoutDetails = {
  full_name: string; phone: string; email?: string; address_line_1: string;
  address_line_2?: string; locality: string; landmark?: string; city: string;
  state: string; postal_code: string; country: "India";
};
export type CheckoutItem = { sku: string; quantity: number };
export type CreatedOrder = { order_number: string; access_token: string | null; duplicate: boolean; total: number };
export type OrderReceipt = {
  order_number: string; customer_name: string; phone: string; email: string | null;
  shipping_address: CheckoutDetails; subtotal:number; shipping_amount:number; discount_amount:number; total_amount: number; payment_method: PaymentMethod;
  payment_status: string; order_status: string; created_at: string;
  order_items: Array<{ product_name:string; sku:string; size:string; colour:string|null; unit_price:number; quantity:number; line_total:number; image_url:string|null }>;
};
