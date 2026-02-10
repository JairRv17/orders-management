<?php

namespace App\Entity;

use App\Repository\ProductRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
class Product
{
  #[ORM\Id]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  private ?int $id = null;

  #[ORM\Column(length: 255)]
  private string $name;

  #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2)]
  private string $price;

  #[ORM\Column]
  private int $stock;

  public function __construct(string $name, string $price, int $stock)
  {
    if (trim($name) === '') {
      throw new \InvalidArgumentException('Name cannot be empty');
    }
    if (!preg_match('/^\d+(\.\d{1,2})?$/', $price)) {
      throw new \InvalidArgumentException('Price must be a valid decimal with up to 2 decimals');
    }
    if (bccomp($price, '0', 2) <= 0) {
      throw new \InvalidArgumentException('Price must be greater than zero');
    }
    if ($stock < 0) {
      throw new \InvalidArgumentException('Stock cannot be negative');
    }
    $this->name = $name;
    $this->price = $price;
    $this->stock = $stock;
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getName(): string
  {
    return $this->name;
  }

  public function getPrice(): string
  {
    return $this->price;
  }

  public function getStock(): int
  {
    return $this->stock;
  }

  public function decreaseStock(int $quantity): void
  {
    if ($quantity <= 0) {
      throw new \InvalidArgumentException('Quantity must be greater than zero');
    }
    if ($this->stock < $quantity) {
      throw new \DomainException('Insufficient stock');
    }
    $this->stock -= $quantity;
  }
}
