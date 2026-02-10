<?php

declare(strict_types=1);

namespace App\Application\Order\Response;

use App\Entity\Order;

final class OrderResponseDTO
{
  /**
   * @param OrderItemResponseDTO[] $items
   */
  public function __construct(
    public readonly int $id,
    public readonly string $customerId,
    public readonly string $status,
    public readonly string $total,
    public readonly string $createdAt,
    public readonly array $items,
  ) {}

  public static function fromEntity(Order $order): self
  {
    return new self(
      $order->getId(),
      $order->getCustomerId(),
      $order->getStatus()->value,
      $order->getTotal(),
      $order->getCreatedAt()->format('Y-m-d H:i:s'),
      array_map(
        fn($item) => OrderItemResponseDTO::fromEntity($item),
        $order->getItems()->toArray()
      )
    );
  }
}
