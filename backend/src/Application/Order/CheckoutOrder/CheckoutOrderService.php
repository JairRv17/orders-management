<?php

declare(strict_types=1);

namespace App\Application\Order\CheckoutOrder;

use App\Application\Exception\ForbiddenOrderAccessException;
use App\Application\Exception\OrderNotFoundException;
use App\Entity\Order;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;

final class CheckoutOrderService
{
  public function __construct(
    private readonly OrderRepository $orderRepository,
    private readonly EntityManagerInterface $em
  ) {}

  public function execute(int $orderId, string $customerId): Order
  {
    if (trim($customerId) === '') {
      throw new \InvalidArgumentException('Customer ID is required');
    }

    return $this->em->wrapInTransaction(function () use ($orderId, $customerId): Order {
      $order = $this->orderRepository->find($orderId);

      if (!$order instanceof Order) {
        throw new OrderNotFoundException();
      }
      if ($order->getCustomerId() !== $customerId) {
        throw new ForbiddenOrderAccessException();
      }
      $order->pay();
      $this->orderRepository->save($order);

      return $order;
    });
  }
}
