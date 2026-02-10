<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\Order;

use App\Application\Exception\ProductNotFoundException;
use App\Application\Order\CreateOrder\CreateOrderCommand;
use App\Application\Order\CreateOrder\CreateOrderItemDTO;
use App\Application\Order\CreateOrder\CreateOrderService;
use App\Entity\Product;
use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

final class CreateOrderServiceTest extends TestCase
{
  private OrderRepository $orderRepository;
  private ProductRepository $productRepository;
  private EntityManagerInterface $em;
  private CreateOrderService $service;

  protected function setUp(): void
  {
    $this->orderRepository = $this->createMock(OrderRepository::class);
    $this->productRepository = $this->createStub(ProductRepository::class);
    $this->em = $this->createStub(EntityManagerInterface::class);

    $this->em->method('wrapInTransaction')
      ->willReturnCallback(fn(callable $callback) => $callback());

    $this->service = new CreateOrderService(
      $this->orderRepository,
      $this->productRepository,
      $this->em
    );
  }

  public function testCreateOrderSuccessfully(): void
  {
    $product = new Product('Iphone 16 Pro', '1299.99', 10);

    $this->productRepository
      ->method('find')
      ->with(1)
      ->willReturn($product);

    $this->orderRepository
      ->expects($this->once())
      ->method('save');

    $command = new CreateOrderCommand('customer1', [
      new CreateOrderItemDTO(1, 2),
    ]);

    $order = $this->service->execute($command);

    $this->assertSame('customer1', $order->getCustomerId());
    $this->assertSame(OrderStatus::PENDING, $order->getStatus());
    $this->assertCount(1, $order->getItems());
    $this->assertSame('2599.98', $order->getTotal()); // 1299.99 * 2
  }

  public function testThrowsWhenProductNotFound(): void
  {
    $this->productRepository
      ->method('find')
      ->willReturn(null);

    $this->orderRepository
      ->expects($this->never())
      ->method('save');

    $command = new CreateOrderCommand('customer1', [
      new CreateOrderItemDTO(999, 1),
    ]);

    $this->expectException(ProductNotFoundException::class);

    $this->service->execute($command);
  }

  public function testDecreasesProductStock(): void
  {
    $product = new Product('Iphone 16 Pro', '1299.99', 10);

    $this->productRepository
      ->method('find')
      ->willReturn($product);

    $this->orderRepository
      ->expects($this->once())
      ->method('save');

    $command = new CreateOrderCommand('customer1', [
      new CreateOrderItemDTO(1, 3),
    ]);

    $this->service->execute($command);

    $this->assertSame(7, $product->getStock()); // 10 - 3 = 7
  }
}
