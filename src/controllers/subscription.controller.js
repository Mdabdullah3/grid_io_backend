import Subscription from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
const subscribeUser = asyncHandler(async (req, res) => {
    const { subscriber, channel } = req.body

    if (!subscriber & !channel) {
        throw new ApiError(400, "Subscriber and Channel is required")
    }

    const subscription = await Subscription.create({
        subscriber,
        channel
    })

    return res.status(200).json(
        new ApiResponse(200, subscription, "Subscription created successfully")
    );
})

const unSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }
    return res.status(200).json(
        new ApiResponse(200, {}, "Unsubscribe successfully")
    );
});

export { subscribeUser, unSubscription } 