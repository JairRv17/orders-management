<?php

namespace App\Controller\Api;

use App\Application\Product\CreateProduct\CreateProductCommand;
use App\Application\Product\CreateProduct\CreateProductService;
use App\Application\Product\Response\ProductResponseDTO;
use App\Repository\ProductRepository;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
#[OA\Tag(name: 'Products')]
final class ProductController extends AbstractController
{
  #[Route('/products', name: 'api_products_create', methods: ['POST'], format: 'json')]
  #[OA\Post(
    summary: 'Create a new product',
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\JsonContent(
        required: ['name', 'price', 'stock'],
        properties: [
          new OA\Property(property: 'name', type: 'string', example: 'Iphone 16 Pro'),
          new OA\Property(property: 'price', type: 'string', example: '1299.99'),
          new OA\Property(property: 'stock', type: 'integer', example: 10),
        ]
      )
    ),
    responses: [
      new OA\Response(response: 201, description: 'Product created successfully'),
      new OA\Response(response: 400, description: 'Invalid input'),
    ]
  )]
  public function create(
    Request $request,
    CreateProductService $service,
    ValidatorInterface $validator
  ): JsonResponse {
    try {
      $data = json_decode(
        $request->getContent(),
        true,
        512,
        JSON_THROW_ON_ERROR
      );
    } catch (\JsonException) {
      return $this->json(
        ['error' => 'Invalid JSON body'],
        Response::HTTP_BAD_REQUEST
      );
    }
    $command = new CreateProductCommand(
      $data['name'] ?? '',
      $data['price'] ?? '',
      (int) ($data['stock'] ?? 0)
    );

    $errors = $validator->validate($command);
    if ($errors->count() > 0) {
      $formattedErrors = [];
      foreach ($errors as $error) {
        $propertyPath = $error->getPropertyPath();
        $message = $error->getMessage();
        $formattedErrors[] = $propertyPath ? "{$propertyPath}: {$message}" : $message;
      }
      return $this->json(
        ['errors' => $formattedErrors],
        Response::HTTP_BAD_REQUEST
      );
    }

    try {
      $product = $service->execute($command);
    } catch (\InvalidArgumentException $e) {
      return $this->json(
        ['error' => $e->getMessage()],
        Response::HTTP_BAD_REQUEST
      );
    }

    return $this->json(ProductResponseDTO::fromEntity($product), Response::HTTP_CREATED);
  }

  #[Route('/products', name: 'api_products_index', methods: ['GET'], format: 'json')]
  #[OA\Get(
    summary: 'List products with pagination and filters',
    parameters: [
      new OA\Parameter(name: 'search', in: 'query', description: 'Search by name', schema: new OA\Schema(type: 'string')),
      new OA\Parameter(name: 'sort', in: 'query', description: 'Sort by field', schema: new OA\Schema(type: 'string')),
      new OA\Parameter(name: 'page', in: 'query', description: 'Page number', schema: new OA\Schema(type: 'integer', default: 1)),
    ],
    responses: [
      new OA\Response(response: 200, description: 'List of products'),
    ]
  )]
  public function index(
    Request $request,
    ProductRepository $productRepository,
  ): JsonResponse {
    $search = $request->query->get('search', '');
    $sortBy = $request->query->get('sort', '');
    $page = $request->query->getInt('page', 1);
    $limit = 10;

    $products = $productRepository->findWithFilters($search, $sortBy, $page, $limit);
    $total = $productRepository->countWithFilters($search);

    return $this->json([
      'data' => array_map(fn($b) => ProductResponseDTO::fromEntity($b), $products),
      'meta' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'pages' => (int) ceil($total / $limit),
      ],
    ]);
  }
}
