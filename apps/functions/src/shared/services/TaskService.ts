export interface TaskService {
  addOrderTask: (order: {
    orderId: string;
    ownerId: string;
    priceId: string;
    productId: string;
  }) => Promise<string | null>;
}
