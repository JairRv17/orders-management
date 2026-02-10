<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\Order;

use App\Application\Exception\ForbiddenOrderAccessException;
use App\Application\Exception\OrderNotFoundException;
use App\Application\Order\CheckoutOrder\CheckoutOrderService;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

final class CheckoutOrderServiceTest extends TestCase
{
  private OrderRepository $orderRepository;
  private EntityManagerInterface $em;
  private CheckoutOrderService $service;

  protected function setUp(): void
  {
    $this->orderRepository = $this->createMock(OrderRepository::class);
    $this->em = $this->createStub(EntityManagerInterface::class);

    $this->em->method('wrapInTransaction')
      ->willReturnCallback(fn(callable $callback) => $callback());

    $this->service = new CheckoutOrderService(
      $this->orderRepository,
      $this->em
    );
  }

  private function createOrderWithItem(string $customerId): Order
  {
    $order = new Order($customerId, new \DateTimeImmutable());
    $product = new Product('Iphone 16 Pro', '1299.99', 10);
    $order->addItem(new OrderItem($product, '1299.99', 1));
    return $order;
  }

  public function testCheckoutSuccessfully(): void
  {
    $order = $this->createOrderWithItem('customer1');

    $this->orderRepository
      ->method('find')
      ->willReturn($order);

    $this->orderRepository
      ->expects($this->once())
      ->method('save');

    $result = $this->service->execute(1, 'customer1');

    $this->assertSame(OrderStatus::PAID, $result->getStatus());
  }

  public function testThrowsWhenCustomerIdEmpty(): void
  {
    $this->orderRepository
      ->expects($this->never())
      ->method('save');

    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Customer ID is required');

    $this->service->execute(1, '');
  }

  public function testThrowsWhenOrderNotFound(): void
  {
    $this->orderRepository
      ->method('find')
      ->willReturn(null);

    $this->orderRepository
      ->expects($this->never())
      ->method('save');

    $this->expectException(OrderNotFoundException::class);

    $this->service->execute(999, 'customer1');
  }

  public function testThrowsWhenOrderDoesNotBelongToCustomer(): void
  {
    $order = $this->createOrderWithItem('customer2');

    $this->orderRepository
      ->method('find')
      ->willReturn($order);

    $this->orderRepository
      ->expects($this->never())
      ->method('save');

    $this->expectException(ForbiddenOrderAccessException::class);

    $this->service->execute(1, 'customer1');
  }

  public function testThrowsWhenOrderAlreadyPaid(): void
  {
    $order = $this->createOrderWithItem('customer1');
    $order->pay();

    $this->orderRepository
      ->method('find')
      ->willReturn($order);

    $this->orderRepository
      ->expects($this->never())
      ->method('save');

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('Order is not in pending state');

    $this->service->execute(1, 'customer1');
  }
}
