<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\OrderItem;
use App\Entity\Product;
use PHPUnit\Framework\TestCase;

final class OrderItemTest extends TestCase
{
  public function testCanCreateOrderItem(): void
  {
    $product = new Product('Macbook Air', '800.00', 10);
    $item = new OrderItem($product, '800.00', 2);

    $this->assertSame($product, $item->getProduct());
    $this->assertSame('800.00', $item->getUnitPrice());
    $this->assertSame(2, $item->getQuantity());
  }

  public function testQuantityMustBeGreaterThanZero(): void
  {
    $product = new Product('Macbook Air', '800.00', 10);

    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Quantity must be greater than zero');

    new OrderItem($product, '800.00', 0);
  }

  public function testUnitPriceMustBeGreaterThanZero(): void
  {
    $product = new Product('Macbook Air', '800.00', 10);

    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Unit price must be greater than zero');

    new OrderItem($product, '0.00', 2);
  }

  public function testSubtotalIsCalculatedCorrectly(): void
  {
    $product = new Product('Macbook Air', '800.00', 10);
    $item = new OrderItem($product, '800.00', 4);

    // 800.00 * 4 = 3200.00
    $this->assertSame('3200.00', $item->getSubtotal());
  }
}
