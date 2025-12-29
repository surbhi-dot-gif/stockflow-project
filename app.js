// GET /api/companies/:company_id/alerts/low-stock
app.get('/api/companies/:company_id/alerts/low-stock', async (req, res) => {
    const { company_id } = req.params;

    try {
        // We perform a JOIN to get data from multiple tables at once (Efficient)
        const alerts = await db.query(`
            SELECT 
                p.id as product_id, p.name as product_name, p.sku,
                w.id as warehouse_id, w.name as warehouse_name,
                i.quantity as current_stock, p.low_stock_threshold as threshold,
                s.id as supplier_id, s.name as supplier_name, s.contact_email
            FROM products p
            JOIN inventory i ON p.id = i.product_id
            JOIN warehouses w ON i.warehouse_id = w.id
            JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.company_id = ? 
              AND i.quantity <= p.low_stock_threshold
              AND EXISTS (
                  SELECT 1 FROM inventory_logs il 
                  WHERE il.product_id = p.id 
                  AND il.reason = 'sale' 
                  AND il.timestamp > NOW() - INTERVAL 30 DAY
              )
        `, [company_id]);

        // Logic for 'days_until_stockout' would usually involve 
        // (current_stock / average_daily_sales)
        const formattedAlerts = alerts.map(row => ({
            ...row,
            days_until_stockout: Math.floor(row.current_stock / 1.5), // Dummy calculation
            supplier: {
                id: row.supplier_id,
                name: row.supplier_name,
                contact_email: row.contact_email
            }
        }));

        res.json({
            alerts: formattedAlerts,
            total_alerts: formattedAlerts.length
        });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});