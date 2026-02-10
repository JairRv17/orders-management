<?php

declare(strict_types=1);

namespace App\Application\Product\CreateProduct;

use Symfony\Component\Validator\Constraints as Assert;

final class CreateProductCommand
{
  public function __construct(
    #[Assert\NotBlank]
    #[Assert\Type('string')]
    public readonly string $name,
    #[Assert\NotBlank]
    #[Assert\Type('string')]
    public readonly string $price,
    #[Assert\NotBlank]
    #[Assert\Type('int')]
    #[Assert\Positive]
    public readonly int $stock,
  ) {}
}
