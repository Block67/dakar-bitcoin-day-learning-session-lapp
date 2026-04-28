const axios = require("axios");

function setupPay(app) {
  app.post("/invoice", async function (req, res) {
    try {
      const { amount, comment } = req.body;

      const btcpayUrl = process.env.BTCPAY_URL;
      const storeId = process.env.BTCPAY_STORE_ID;
      const apiKey = process.env.BTCPAY_API_KEY;

      if (!btcpayUrl || !storeId || !apiKey) {
        return res.status(500).json({ error: "BTCPay Server is not configured in .env" });
      }

      // Create invoice on BTCPay Server
      const response = await axios.post(
        `${btcpayUrl}/api/v1/stores/${storeId}/invoices`,
        {
          amount: amount,
          currency: "SATS", // Or XOF/USD depending on your setup
          metadata: {
            orderId: `order-${Date.now()}`,
            itemDesc: comment || "Payment on Lightning App",
          },
          checkout: {
            speedPolicy: "HighSpeed",
            paymentMethods: ["BTC-LightningNetwork"],
            redirectURL: `https://${req.get("host")}/profile`,
          },
        },
        {
          headers: {
            "Authorization": `token ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Return the checkout link as expected by src/js/pay.js
      res.json({
        id: response.data.id,
        checkoutLink: response.data.checkoutLink,
      });
    } catch (e) {
      console.error("BTCPay Invoice Error:", e.response ? e.response.data : e.message);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Optional: Webhook endpoint for payment confirmation
  app.post("/webhook", (req, res) => {
    // Logic for BTCPay Webhooks
    res.status(200).send("OK");
  });
}

module.exports = { setupPay };
