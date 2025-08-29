// import { placeOrder } from "../services/xtsService.js";

// import { placeOrder } from "../../services/example/interactiveTestApi";

export const placeTradeOrder = async (req, res) => {
  try {
    const order = req.body;
    console.log("📤 Received order request:", order);

    const response = await placeOrder(order);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: response,
    });
  } catch (err) {
    console.error("❌ Error placing order:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: err.message,
    });
  }
};
