<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Product;
use PHPUnit\Framework\TestCase;

final class ProductTest extends TestCase
{
  public function testCanCreateProduct(): void
  {
    $product = new Product('Iphone 16 Pro Max', '1299.99', 10);

    $this->assertSame('Iphone 16 Pro Max', $product->getName());
    $this->assertSame('1299.99', $product->getPrice());
    $this->assertSame(10, $product->getStock());
  }

  public function testNameCannotBeEmpty(): void
  {
    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Name cannot be empty');

    new Product('', '1299.99', 10);
  }

  public function testPriceMustBeValidDecimal(): void
  {
    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Price must be a valid decimal with up to 2 decimals');

    new Product('Iphone 16 Pro Max', '1299,99', 10);
  }

  public function testPriceMustBeGreaterThanZero(): void
  {
    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Price must be greater than zero');

    new Product('Iphone 16 Pro Max', '0.00', 10);
  }

  public function testStockCannotBeNegative(): void
  {
    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Stock cannot be negative');

    new Product('Iphone 16 Pro Max', '1299.99', -5);
  }

  public function testDecreaseStock(): void
  {
    $product = new Product('Iphone 16 Pro Max', '1299.99', 10);

    $product->decreaseStock(3);

    $this->assertSame(7, $product->getStock());
  }

  public function testDecreaseStockThrowsWhenQuantityNotPositive(): void
  {
    $product = new Product('Iphone 16 Pro Max', '1299.99', 10);

    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Quantity must be greater than zero');

    $product->decreaseStock(0);
  }

  public function testDecreaseStockThrowsWhenInsufficientStock(): void
  {
    $product = new Product('Iphone 16 Pro Max', '1299.99', 10);

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('Insufficient stock');

    $product->decreaseStock(11);
  }
}
