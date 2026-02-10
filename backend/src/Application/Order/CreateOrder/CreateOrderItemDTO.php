<?php

declare(strict_types=1);

namespace App\Application\Order\CreateOrder;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateOrderItemDTO
{
  public function __construct(
    #[Assert\NotBlank]
    #[Assert\Type('int')]
    #[Assert\Positive]
    public readonly int $productId,
    #[Assert\NotBlank]
    #[Assert\Type('int')]
    #[Assert\Positive]
    public readonly int $quantity,
  ) {}
}
