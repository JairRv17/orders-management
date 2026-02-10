<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\Order;

use App\Application\Exception\ForbiddenOrderAccessException;
use App\Application\Exception\OrderNotFoundException;
use App\Application\Order\GetOrder\GetOrderService;
use App\Entity\Order;
use App\Repository\OrderRepository;
use PHPUnit\Framework\TestCase;

final class GetOrderServiceTest extends TestCase
{
  private OrderRepository $orderRepository;
  private GetOrderService $service;

  protected function setUp(): void
  {
    $this->orderRepository = $this->createStub(OrderRepository::class);
    $this->service = new GetOrderService($this->orderRepository);
  }

  public function testGetOrderSuccessfully(): void
  {
    $order = new Order('customer1', new \DateTimeImmutable());

    $this->orderRepository
      ->method('find')
      ->with(1)
      ->willReturn($order);

    $result = $this->service->execute(1, 'customer1');

    $this->assertSame($order, $result);
  }

  public function testThrowsWhenCustomerIdEmpty(): void
  {
    $this->expectException(\InvalidArgumentException::class);
    $this->expectExceptionMessage('Customer ID is required');

    $this->service->execute(1, '');
  }

  public function testThrowsWhenOrderNotFound(): void
  {
    $this->orderRepository
      ->method('find')
      ->willReturn(null);

    $this->expectException(OrderNotFoundException::class);

    $this->service->execute(999, 'customer1');
  }

  public function testThrowsWhenOrderDoesNotBelongToCustomer(): void
  {
    $order = new Order('other-customer', new \DateTimeImmutable());

    $this->orderRepository
      ->method('find')
      ->willReturn($order);

    $this->expectException(ForbiddenOrderAccessException::class);

    $this->service->execute(1, 'customer1');
  }
}
