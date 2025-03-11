/**
 * @swagger
 * /api/v1/subscription/subscribe:
 *   post:
 *     summary: Subscribe to a channel
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriber
 *               - channel
 *             properties:
 *               subscriber:
 *                 type: string
 *                 description: User ID of the subscriber
 *               channel:
 *                 type: string
 *                 description: ID of the channel to subscribe to
 *     responses:
 *       200:
 *         description: Subscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Channel not found
 */

/**
 * @swagger
 * /api/v1/subscription/unsubscribe/{id}:
 *   delete:
 *     summary: Unsubscribe from a channel
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID to unsubscribe
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Subscription not found
 */
