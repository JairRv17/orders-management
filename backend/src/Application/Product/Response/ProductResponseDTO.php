<?php

declare(strict_types=1);

namespace App\Application\Product\Response;

use App\Entity\Product;

final class ProductResponseDTO
{
  public function __construct(
    public readonly int $id,
    public readonly string $name,
    public readonly string $price,
    public readonly int $stock,
  ) {}

  public static function fromEntity(Product $product): self
  {
    return new self(
      $product->getId(),
      $product->getName(),
      $product->getPrice(),
      $product->getStock(),
    );
  }
}
