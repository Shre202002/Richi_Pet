import PageHeader from "@/components/PageHeader";
import { OrderList } from "@/components/OrderViews";

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="My orders" />
      <OrderList />
    </>
  );
}
