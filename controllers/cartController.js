class CartController {
    constructor() {
        this.addToCart = this.addToCart.bind(this);
        this.removeFromCart = this.removeFromCart.bind(this);
        this.getCart = this.getCart.bind(this);
    }

    addToCart(req, res) {
        res.status(200).json({ message: 'Product added to cart' });
    }

    removeFromCart(req, res) {
        res.status(200).json({ message: 'Product removed from cart' });
    }

    getCart(req, res) {
        res.status(200).json({ message: 'Cart details fetched' });
    }
}

module.exports = CartController;