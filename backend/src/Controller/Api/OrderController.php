<?php

namespace App\Controller\Api;

use App\Application\Exception\ForbiddenOrderAccessException;
use App\Application\Exception\OrderNotFoundException;
use App\Application\Exception\ProductNotFoundException;
use App\Application\Order\CheckoutOrder\CheckoutOrderService;
use App\Application\Order\CreateOrder\CreateOrderCommand;
use App\Application\Order\CreateOrder\CreateOrderItemDTO;
use App\Application\Order\CreateOrder\CreateOrderService;
use App\Application\Order\GetOrder\GetOrderService;
use App\Application\Order\Response\OrderResponseDTO;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
#[OA\Tag(name: 'Orders')]
final class OrderController extends AbstractController
{
  #[Route('/orders', name: 'api_orders_create', methods: ['POST'], format: 'json')]
  #[OA\Post(
    summary: 'Create a new order',
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\JsonContent(
        required: ['customerId', 'items'],
        properties: [
          new OA\Property(property: 'customerId', type: 'string', example: 'customer1'),
          new OA\Property(
            property: 'items',
            type: 'array',
            items: new OA\Items(
              properties: [
                new OA\Property(property: 'productId', type: 'integer', example: 1),
                new OA\Property(property: 'quantity', type: 'integer', example: 2),
              ]
            )
          ),
        ]
      )
    ),
    responses: [
      new OA\Response(response: 201, description: 'Order created successfully'),
      new OA\Response(response: 400, description: 'Invalid input'),
      new OA\Response(response: 404, description: 'Product not found'),
    ]
  )]
  public function create(
    Request $request,
    CreateOrderService $service,
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

    $items = array_map(
      fn(array $item) => new CreateOrderItemDTO(
        (int) ($item['productId'] ?? 0),
        (int) ($item['quantity'] ?? 0),
      ),
      $data['items'] ?? []
    );

    $command = new CreateOrderCommand(
      (string) ($data['customerId'] ?? ''),
      $items
    );

    $errors = $validator->validate($command);

    if (count($errors) > 0) {
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
      $order = $service->execute($command);
    } catch (ProductNotFoundException) {
      return $this->json(
        ['error' => 'Product not found'],
        Response::HTTP_NOT_FOUND
      );
    } catch (\InvalidArgumentException $e) {
      return $this->json(
        ['error' => $e->getMessage()],
        Response::HTTP_BAD_REQUEST
      );
    } catch (\DomainException $e) {
      return $this->json(
        ['error' => $e->getMessage()],
        Response::HTTP_UNPROCESSABLE_ENTITY
      );
    }

    return $this->json(OrderResponseDTO::fromEntity($order), Response::HTTP_CREATED);
  }

  #[Route('/orders/{id}', name: 'api_orders_show', methods: ['GET'], format: 'json')]
  #[OA\Get(
    summary: 'Get order details',
    parameters: [
      new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
      new OA\Parameter(name: 'customerId', in: 'query', required: true, description: 'Customer ID for validation', schema: new OA\Schema(type: 'string')),
    ],
    responses: [
      new OA\Response(response: 200, description: 'Order details'),
      new OA\Response(response: 400, description: 'Missing customerId'),
      new OA\Response(response: 403, description: 'Forbidden - order belongs to another customer'),
      new OA\Response(response: 404, description: 'Order not found'),
    ]
  )]
  public function show(
    int $id,
    Request $request,
    GetOrderService $getOrderService
  ): JsonResponse {
    // Simulate user authentication
    $customerId = (string) $request->query->get('customerId', '');

    try {
      $order = $getOrderService->execute($id, $customerId);
    } catch (\InvalidArgumentException $e) {
      return $this->json(
        ['error' => $e->getMessage()],
        Response::HTTP_BAD_REQUEST
      );
    } catch (OrderNotFoundException) {
      return $this->json(
        ['error' => 'Order not found'],
        Response::HTTP_NOT_FOUND
      );
    } catch (ForbiddenOrderAccessException) {
      return $this->json(
        ['error' => 'You do not have permission to access this order'],
        Response::HTTP_FORBIDDEN
      );
    }

    return $this->json(OrderResponseDTO::fromEntity($order), Response::HTTP_OK);
  }

  #[Route('/orders/{id}/checkout', name: 'api_orders_checkout', methods: ['POST'], format: 'json')]
  #[OA\Post(
    summary: 'Checkout an order (process payment)',
    parameters: [
      new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    ],
    requestBody: new OA\RequestBody(
      required: true,
      content: new OA\JsonContent(
        required: ['customerId'],
        properties: [
          new OA\Property(property: 'customerId', type: 'string', example: 'customer1'),
        ]
      )
    ),
    responses: [
      new OA\Response(response: 200, description: 'Order paid successfully'),
      new OA\Response(response: 400, description: 'Missing customerId'),
      new OA\Response(response: 403, description: 'Forbidden - order belongs to another customer'),
      new OA\Response(response: 404, description: 'Order not found'),
      new OA\Response(response: 422, description: 'Order is not in pending state'),
    ]
  )]
  public function checkout(
    int $id,
    Request $request,
    CheckoutOrderService $checkoutOrderService
  ): JsonResponse {
    try {
      $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
    } catch (\JsonException) {
      return $this->json(['error' => 'Invalid JSON body'], Response::HTTP_BAD_REQUEST);
    }
    // Simulate user authentication
    $customerId = (string) ($data['customerId'] ?? '');

    try {
      $order = $checkoutOrderService->execute($id, $customerId);
    } catch (\InvalidArgumentException $e) {
      return $this->json(
        ['error' => $e->getMessage()],
        Response::HTTP_BAD_REQUEST
      );
    } catch (OrderNotFoundException) {
      return $this->json(
        ['error' => 'Order not found'],
        Response::HTTP_NOT_FOUND
      );
    } catch (ForbiddenOrderAccessException) {
      return $this->json(
        ['error' => 'You do not have permission to access this order'],
        Response::HTTP_FORBIDDEN
      );
    } catch (\DomainException $e) {
      return $this->json(
        ['error' => $e->getMessage()],
        Response::HTTP_UNPROCESSABLE_ENTITY
      );
    }

    return $this->json(OrderResponseDTO::fromEntity($order), Response::HTTP_OK);
  }
}
