import { defineField, defineType } from "sanity";

export const shopMkOrderType = defineType({
  name: "shopMkOrder",
  title: "Shop MK Order",
  type: "document",
  fields: [
    defineField({ name: "orderId", title: "Order ID", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "customer", title: "Customer", type: "object", fields: [
      defineField({ name: "name", type: "string" }),
      defineField({ name: "email", type: "string" }),
      defineField({ name: "phone", type: "string" }),
    ] }),
    defineField({ name: "delivery", title: "Delivery", type: "object", fields: [
      defineField({ name: "address", type: "string" }),
      defineField({ name: "city", type: "string" }),
      defineField({ name: "state", type: "string" }),
      defineField({ name: "note", type: "text" }),
      defineField({ name: "method", type: "string" }),
      defineField({ name: "feePayment", type: "string" }),
    ] }),
    defineField({ name: "items", title: "Items", type: "array", of: [{ type: "object", fields: [
      defineField({ name: "slug", type: "string" }),
      defineField({ name: "title", type: "string" }),
      defineField({ name: "price", type: "number" }),
      defineField({ name: "quantity", type: "number" }),
      defineField({ name: "color", type: "string" }),
      defineField({ name: "image", type: "url" }),
      defineField({ name: "lineTotal", type: "number" }),
    ] }] }),
    defineField({ name: "amount", type: "number" }),
    defineField({ name: "currency", type: "string" }),
    defineField({ name: "paymentStatus", type: "string" }),
    defineField({ name: "orderStatus", type: "string" }),
    defineField({ name: "paymentReference", type: "string" }),
    defineField({ name: "paymentChannel", type: "string" }),
    defineField({ name: "gatewayResponse", type: "string" }),
    defineField({ name: "customerCode", type: "string" }),
    defineField({ name: "deliveryFee", type: "number" }),
    defineField({ name: "createdAt", type: "datetime" }),
    defineField({ name: "paidAt", type: "datetime" }),
    defineField({ name: "updatedAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "orderId", customer: "customer.name", amount: "amount", status: "paymentStatus" },
    prepare({ title, customer, amount, status }) {
      return { title: `${title} — ${customer || "Customer"}`, subtitle: `₦${Number(amount || 0).toLocaleString()} · ${status || "pending"}` };
    },
  },
});
