<?php

declare(strict_types=1);

namespace App\Application\Order\CreateOrder;

use App\Application\Exception\ProductNotFoundException;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;

final class CreateOrderService
{
  public function __construct(
    private readonly OrderRepository $orderRepository,
    private readonly ProductRepository $productRepository,
    private readonly EntityManagerInterface $em,
  ) {}

  public function execute(CreateOrderCommand $command): Order
  {
    return $this->em->wrapInTransaction(function () use ($command): Order {

      $order = new Order($command->customerId, new \DateTimeImmutable());

      foreach ($command->items as $itemDTO) {
        $product = $this->productRepository->find($itemDTO->productId);

        if (!$product instanceof Product) {
          throw new ProductNotFoundException();
        }

        $orderItem = new OrderItem(
          $product,
          $product->getPrice(),
          $itemDTO->quantity
        );

        $product->decreaseStock($itemDTO->quantity);
        $order->addItem($orderItem);
      }

      $this->orderRepository->save($order);

      return $order;
    });
  }
}
