<?php

namespace App\Entity;

use App\Repository\OrderItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
class OrderItem
{
  #[ORM\Id]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  private ?int $id = null;

  #[ORM\ManyToOne(inversedBy: 'items')]
  #[ORM\JoinColumn(nullable: false)]
  private Order $parentOrder;

  #[ORM\ManyToOne]
  #[ORM\JoinColumn(nullable: false)]
  private Product $product;

  #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2)]
  private string $unitPrice;

  #[ORM\Column]
  private int $quantity;

  public function __construct(Product $product, string $unitPrice, int $quantity)
  {
    if ($quantity <= 0) {
      throw new \InvalidArgumentException('Quantity must be greater than zero');
    }

    if (bccomp($unitPrice, '0', 2) <= 0) {
      throw new \InvalidArgumentException('Unit price must be greater than zero');
    }

    $this->product   = $product;
    $this->unitPrice = $unitPrice;
    $this->quantity  = $quantity;
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getParentOrder(): Order
  {
    return $this->parentOrder;
  }

  /*
   * Should only be called by Order
   */
  public function setParentOrder(Order $order): void
  {
    $this->parentOrder = $order;
  }

  public function getProduct(): Product
  {
    return $this->product;
  }

  public function getUnitPrice(): string
  {
    return $this->unitPrice;
  }

  public function getQuantity(): int
  {
    return $this->quantity;
  }

  public function getSubtotal(): string
  {
    return bcmul($this->unitPrice, (string) $this->quantity, 2);
  }
}
