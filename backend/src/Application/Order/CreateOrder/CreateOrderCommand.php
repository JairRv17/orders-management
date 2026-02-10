<?php

declare(strict_types=1);

namespace App\Application\Order\CreateOrder;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateOrderCommand
{
  /**
   * @param CreateOrderItemDTO[] $items
   */
  public function __construct(
    #[Assert\NotBlank]
    public readonly string $customerId,
    #[Assert\NotBlank]
    #[Assert\Type('array')]
    #[Assert\Count(min: 1)]
    public readonly array $items,
  ) {}
}
