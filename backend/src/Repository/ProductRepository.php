<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
  public function __construct(ManagerRegistry $registry)
  {
    parent::__construct($registry, Product::class);
  }

  public function save(Product $product): void
  {
    $this->getEntityManager()->persist($product);
    $this->getEntityManager()->flush();
  }

  /**
   * @return Product[] Returns an array of Product objects
   */
  public function findWithFilters(string $search, string $sortBy, int $page, int $limit): array
  {
    $query = $this->createQueryBuilder('product');
    if (trim($search) !== '') {
      $query->andWhere('product.name LIKE :search')
        ->setParameter('search', '%' . $search . '%');
    }
    if (trim($sortBy) !== '') {
      $query->orderBy('product.' . $sortBy, 'ASC');
    }

    return $query->setFirstResult(($page - 1) * $limit)
      ->setMaxResults($limit)
      ->getQuery()->getResult();
  }

  /**
   * @return int Returns the number of products
   */
  public function countWithFilters(string $search): int
  {
    $query = $this->createQueryBuilder('product');
    if (trim($search) !== '') {
      $query->andWhere('product.name LIKE :search')
        ->setParameter('search', '%' . $search . '%');
    }

    return $query->select('COUNT(product.id)')
      ->getQuery()->getSingleScalarResult();
  }
}
