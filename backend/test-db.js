const { initDB, logActivity, pool } = require('./db.js');

async function runTest() {
    console.log("--- Starting HydroFlow DB Test ---");
    try {
        // We await the logActivity to make sure it finishes or fails properly
        await logActivity('Test_Chain', 'Verify_DB_Connection', 'Manual_Trigger');
        console.log("✅ Test activity logged.");

        const res = await pool.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 1');
        
        if (res.rows.length > 0) {
            console.log("📊 Latest entry in DB:", res.rows[0]);
        } else {
            console.log("⚠️ Connection OK, but table is empty.");
        }

    } catch (err) {
        // CHANGED: We log the whole 'err' instead of just 'err.message'
        console.error("❌ Test Failed Detail:", err); 
    } finally {
        await pool.end(); // Close the connection so the script exits
    }
}

runTest();