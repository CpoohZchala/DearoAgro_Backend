class CartController {
    constructor(cartModel) {
        this.cartModel = cartModel;
    }

    addToCart(req, res) {
        const { productId, quantity } = req.body;
        const result = this.cartModel.addItem(productId, quantity);
        if (result.success) {
            res.status(200).json({ message: 'Product added to cart', cart: result.cart });
        } else {
            res.status(400).json({ message: result.message });
        }
    }

    removeFromCart(req, res) {
        const { productId } = req.params;
        const result = this.cartModel.removeItem(productId);
        if (result.success) {
            res.status(200).json({ message: 'Product removed from cart', cart: result.cart });
        } else {
            res.status(400).json({ message: result.message });
        }
    }
}

module.exports = CartController;