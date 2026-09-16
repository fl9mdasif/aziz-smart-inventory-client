import { PageHeader } from "@/components/shared/PageHeader";
import { OrderForm } from "@/components/dashboard/OrderForm";
import { OrdersTable } from "@/components/dashboard/OrdersTable";

export default function OrderPage() {
  return (
    <div>
      <PageHeader title="Order" description="Record a sale and view order history" />
      <div className="mb-6">
        <OrderForm />
      </div>
      <OrdersTable />
    </div>
  );
}
