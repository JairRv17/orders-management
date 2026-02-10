<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Enum\OrderStatus;
use PHPUnit\Framework\TestCase;

final class OrderTest extends TestCase
{
  public function testCanCreateOrder(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());

    $this->assertSame('customer1', $order->getCustomerId());
    $this->assertSame(OrderStatus::PENDING, $order->getStatus());
    $this->assertSame('0.00', $order->getTotal());
    $this->assertCount(0, $order->getItems());
  }

  public function testCustomerIdCannotBeEmpty(): void
  {
    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Customer ID cannot be empty');

    new Order('', new \DateTimeImmutable());
  }

  public function testAddItem(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());
    $product = new Product('Iphone 15 pro', '999.99', 10);
    $item = new OrderItem($product, '999.99', 2);

    $order->addItem($item);

    $this->assertCount(1, $order->getItems());
  }

  public function testTotalIsCalculatedCorrectly(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());
    $product1 = new Product('Iphone 15 pro', '999.99', 10);
    $product2 = new Product('Airpods', '200.00', 50);

    $order->addItem(new OrderItem($product1, '999.99', 2));
    $order->addItem(new OrderItem($product2, '200.00', 1));

    // (999.99 * 2) + (200.00 * 1) = 2199.98 + 200.00 = 2199.98
    $this->assertSame('2199.98', $order->getTotal());
  }

  public function testCannotAddItemToPaidOrder(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());
    $product = new Product('Iphone 15 pro', '999.99', 10);
    $order->addItem(new OrderItem($product, '999.99', 1));
    $order->pay();

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('Cannot modify a paid order');

    $order->addItem(new OrderItem($product, '999.99', 1));
  }

  public function testPayChangesStatusToPaid(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());
    $product = new Product('Iphone 15 pro', '999.99', 10);
    $order->addItem(new OrderItem($product, '999.99', 1));

    $order->pay();

    $this->assertSame(OrderStatus::PAID, $order->getStatus());
  }

  public function testCannotPayEmptyOrder(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('Order must have at least one item');

    $order->pay();
  }

  public function testCannotPayAlreadyPaidOrder(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());
    $product = new Product('Iphone 15 pro', '999.99', 10);
    $order->addItem(new OrderItem($product, '999.99', 1));
    $order->pay();

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('Order is not in pending state');

    $order->pay();
  }
}
