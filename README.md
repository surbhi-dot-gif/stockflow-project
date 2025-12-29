## 💡 My Approach

### Part 1: Security & Reliability
I prioritized **Data Integrity**. In the code review, I identified that multiple database commits without a transaction are dangerous. My fix ensures that "StockFlow" never has "ghost products" (products that exist but have no inventory records).

### Part 2: Scalable Database Design
I chose a **Relational Schema (SQL)** because inventory management requires strict consistency. I added an `inventory_logs` table because, in B2B, users need an audit trail to see *why* stock levels changed (e.g., Was it a sale? A return? A theft?).

### Part 3: Performance-First API
For the low-stock alerts, I used a **SQL JOIN** approach. Instead of fetching all products and filtering them in JavaScript (which is slow), I let the database do the heavy lifting. I also added a check for "recent activity" so users aren't bothered by alerts for products that aren't even selling. 
