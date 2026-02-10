<?php

namespace App\Entity;

use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
class Order
{
  #[ORM\Id]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  private ?int $id = null;

  #[ORM\Column(length: 255)]
  private string $customerId;

  #[ORM\Column]
  private \DateTimeImmutable $createdAt;

  #[ORM\Column(enumType: OrderStatus::class)]
  private OrderStatus $status = OrderStatus::PENDING;

  /**
   * @var Collection<int, OrderItem>
   */
  #[ORM\OneToMany(targetEntity: OrderItem::class, mappedBy: 'parentOrder', orphanRemoval: true, cascade: ['persist'])]
  private Collection $items;

  #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2)]
  private string $total = '0.00';

  public function __construct(string $customerId, \DateTimeImmutable $createdAt)
  {
    if (trim($customerId) === '') {
      throw new \InvalidArgumentException('Customer ID cannot be empty');
    }
    $this->customerId = $customerId;
    $this->createdAt = $createdAt;
    $this->items = new ArrayCollection();
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getCustomerId(): string
  {
    return $this->customerId;
  }

  public function getCreatedAt(): \DateTimeImmutable
  {
    return $this->createdAt;
  }

  public function getStatus(): OrderStatus
  {
    return $this->status;
  }

  /**
   * @return Collection<int, OrderItem>
   */
  public function getItems(): Collection
  {
    return $this->items;
  }

  public function getTotal(): string
  {
    return $this->total;
  }

  public function addItem(OrderItem $item): static
  {
    if ($this->status === OrderStatus::PAID) {
      throw new \DomainException('Cannot modify a paid order');
    }
    if (!$this->items->contains($item)) {
      $this->items->add($item);
      $item->setParentOrder($this);
      $this->recalculateTotal();
    }

    return $this;
  }

  public function pay(): void
  {
    if ($this->status !== OrderStatus::PENDING) {
      throw new \DomainException('Order is not in pending state');
    }
    if ($this->items->isEmpty()) {
      throw new \DomainException('Order must have at least one item');
    }
    if (bccomp($this->total, '0', 2) <= 0) {
      throw new \DomainException('Order total must be greater than zero');
    }
    $this->status = OrderStatus::PAID;
  }

  private function recalculateTotal(): void
  {
    $this->total = $this->items->reduce(function ($carry, OrderItem $item) {
      return bcadd($carry, bcmul($item->getUnitPrice(), $item->getQuantity(), 2), 2);
    }, '0.00');
  }
}
