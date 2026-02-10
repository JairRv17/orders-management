<?php

declare(strict_types=1);

namespace App\Application\Product\CreateProduct;

use App\Entity\Product;
use App\Repository\ProductRepository;

final class CreateProductService
{
  public function __construct(
    private readonly ProductRepository $productRepository,
  ) {}

  public function execute(CreateProductCommand $command): Product
  {
    $product = new Product($command->name, $command->price, $command->stock);

    $this->productRepository->save($product);

    return $product;
  }
}
