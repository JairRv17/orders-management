# Data Model

## Entity Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Product     │       │   OrderItem     │       │      Order      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id: int (PK)    │◄──────│ product_id (FK) │       │ id: int (PK)    │
│ name: string    │       │ id: int (PK)    │──────►│ customer_id:    │
│ price: decimal  │       │ order_id (FK)   │       │   string        │
│ stock: int      │       │ unit_price:     │       │ status: enum    │
└─────────────────┘       │   decimal       │       │ total: decimal  │
                          │ quantity: int   │       │ created_at:     │
                          └─────────────────┘       │   datetime      │
                                                    └─────────────────┘
```

## Entities

### Product
| Field | Type | Description |
|-------|------|-------------|
| id | int | Unique identifier (auto-generated) |
| name | string(255) | Product name |
| price | decimal(15,2) | Unit price |
| stock | int | Available quantity |

### Order
| Field | Type | Description |
|-------|------|-------------|
| id | int | Unique identifier (auto-generated) |
| customer_id | string(255) | Customer identifier |
| status | enum | Status: `pending`, `paid` |
| total | decimal(15,2) | Calculated total |
| created_at | datetime | Creation date |

### OrderItem
| Field | Type | Description |
|-------|------|-------------|
| id | int | Unique identifier (auto-generated) |
| order_id | int (FK) | Reference to Order |
| product_id | int (FK) | Reference to Product |
| unit_price | decimal(15,2) | Price at purchase time |
| quantity | int | Requested quantity |

## Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| Order → OrderItem | 1:N | An order has multiple items |
| Product → OrderItem | 1:N | A product can be in multiple items |

## Business Rules

1. **Product**
   - `name` cannot be empty
   - `price` must be greater than 0
   - `stock` cannot be negative

2. **Order**
   - `customer_id` is required
   - `status` starts as `pending`
   - `total` is recalculated when adding items
   - Cannot add items to paid orders

3. **OrderItem**
   - `quantity` must be greater than 0
   - `unit_price` is captured from product at creation

4. **Checkout**
   - Only `pending` orders can be paid
   - Order must have at least one item
   - Total must be greater than 0
