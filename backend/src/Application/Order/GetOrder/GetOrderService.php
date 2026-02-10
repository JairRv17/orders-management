<?php

declare(strict_types=1);

namespace App\Application\Order\GetOrder;

use App\Application\Exception\ForbiddenOrderAccessException;
use App\Application\Exception\OrderNotFoundException;
use App\Entity\Order;
use App\Repository\OrderRepository;

final class GetOrderService
{
  public function __construct(
    private readonly OrderRepository $orderRepository
  ) {}

  public function execute(int $orderId, string $customerId): Order
  {
    if (trim($customerId) === '') {
      throw new \InvalidArgumentException('Customer ID is required');
    }
    $order = $this->orderRepository->find($orderId);
    if (!$order instanceof Order) {
      throw new OrderNotFoundException();
    }
    if ($order->getCustomerId() !== $customerId) {
      throw new ForbiddenOrderAccessException();
    }

    return $order;
  }
}
