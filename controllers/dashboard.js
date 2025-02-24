const express = require("express");
const axios = require("axios");
const coinPriceHistory = require("../models/coinPriceHistory")
const router = express.Router();

router.get("/", async (req, res) => {
    let coinSearch = req.query.coinSearch || "bitcoin";
    coinSearch = coinSearch.toLowerCase();
    const user = req.session.user;
    if(!user){
        res.redirect("/auth/sign-in");
    }
    try {
        const response = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price",
            {
                params: {
                    ids: coinSearch,
                    vs_currencies: "usd",
                },
            }
        );
        const historicalData = await getHistoricalData(coinSearch);
        res.render("dashboard/index.ejs", {
            coinData: response.data,
            coinSearch: coinSearch,
            user: user,
            historicalData: historicalData,
        });
    } catch (error) {
        console.error("Error fetching crypto prices:", error);
        res.status(500);
        res.redirect("/");
    }
});
async function getHistoricalData(coinId) {
    try {
        // Query the database to get the historical data for the given coinId
        const historicalData = await coinPriceHistory.find({ coinId: coinId })
            .sort({ timestamp: 1 }) // Sort by timestamp in ascending order (oldest first)
            .select('timestamp price'); // Only select the relevant fields

        // Check if historical data exists
        if (!historicalData || historicalData.length === 0) {
            throw new Error("No historical data found for this coin.");
        }

        // Return the historical data
        return historicalData;
    } catch (error) {
        console.error("Error fetching historical data from database:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
}
module.exports = router;
