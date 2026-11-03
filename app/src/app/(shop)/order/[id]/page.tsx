import PageHeader from "@/components/PageHeader";
import { OrderDetail } from "@/components/OrderViews";

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Order" cart={false} />
      <OrderDetail id={id} />
    </>
  );
}
