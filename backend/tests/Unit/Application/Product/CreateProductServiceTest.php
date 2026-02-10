<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\Product;

use App\Application\Product\CreateProduct\CreateProductCommand;
use App\Application\Product\CreateProduct\CreateProductService;
use App\Entity\Product;
use App\Repository\ProductRepository;
use PHPUnit\Framework\TestCase;

final class CreateProductServiceTest extends TestCase
{
  private ProductRepository $productRepository;
  private CreateProductService $service;

  protected function setUp(): void
  {
    $this->productRepository = $this->createMock(ProductRepository::class);
    $this->service = new CreateProductService($this->productRepository);
  }

  public function testCreateProductSuccessfully(): void
  {
    $command = new CreateProductCommand('Iphone 16 Pro', '1299.99', 10);

    $this->productRepository
      ->expects($this->once())
      ->method('save')
      ->with($this->isInstanceOf(Product::class));

    $product = $this->service->execute($command);

    $this->assertSame('Iphone 16 Pro', $product->getName());
    $this->assertSame('1299.99', $product->getPrice());
    $this->assertSame(10, $product->getStock());
  }

  public function testRepositorySaveIsCalled(): void
  {
    $command = new CreateProductCommand('Macbook Air', '999.99', 5);

    $this->productRepository
      ->expects($this->once())
      ->method('save');

    $this->service->execute($command);
  }
}
