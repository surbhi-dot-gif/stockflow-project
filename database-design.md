# Part 2: Database Design (StockFlow)

## 🔍 Business Logic & Clarifications
Before finalizing this schema, I would clarify the following with the Product Team:
1. **Low Stock Definition:** Is the "threshold" global per product, or can it vary per warehouse (e.g., a main hub needs more stock than a small satellite warehouse)?
2. **Bundle Logic:** When a "Bundle" is sold, should the system automatically deduct stock from the individual component products?
3. **Supplier Lead Times:** Do we need to track how long a supplier takes to ship (Lead Time) to accurately calculate the `days_until_stockout`?

### 1. Proposed Schema (SQL)
```sql
-- Represents the B2B Customer
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Physical locations
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    location TEXT
);

-- Product Catalog
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    low_stock_threshold INTEGER DEFAULT 10,
    supplier_id INTEGER REFERENCES suppliers(id)
);

-- Stock levels (Many-to-Many relationship)
CREATE TABLE inventory (
    product_id INTEGER REFERENCES products(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, warehouse_id)
);

-- Audit trail for stock changes
CREATE TABLE inventory_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    change_amount INTEGER,
    reason VARCHAR(50), -- 'sale', 'restock', 'return'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);