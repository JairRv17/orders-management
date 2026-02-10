<?php

namespace App\Enum;

enum OrderStatus: string
{
  case PENDING = 'pending';
  case PAID = 'paid';
  case CANCELLED = 'cancelled';
  case FAILED = 'failed';

  public function label(): string
  {
    return match ($this) {
      self::PENDING => 'Pending',
      self::PAID => 'Paid',
      self::CANCELLED => 'Cancelled',
      self::FAILED => 'Failed'
    };
  }
}
