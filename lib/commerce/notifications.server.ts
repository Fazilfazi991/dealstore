import "server-only";
import type { OrderReceipt } from "./types";
export type OrderNotifier={sendConfirmation(order:OrderReceipt):Promise<{delivered:boolean;provider?:string}>};
export const orderNotifier:OrderNotifier={async sendConfirmation(order){console.info("order_confirmation_pending",{orderNumber:order.order_number});return{delivered:false}}};
