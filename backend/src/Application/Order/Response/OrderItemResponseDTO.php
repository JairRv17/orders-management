<?php

declare(strict_types=1);

namespace App\Application\Order\Response;

use App\Entity\OrderItem;

final class OrderItemResponseDTO
{
  public function __construct(
    public readonly int $productId,
    public readonly string $unitPrice,
    public readonly int $quantity,
    public readonly string $subtotal,
  ) {}

  public static function fromEntity(OrderItem $item): self
  {
    return new self(
      $item->getProduct()->getId(),
      $item->getUnitPrice(),
      $item->getQuantity(),
      $item->getSubtotal()
    );
  }
}
