class CartModel {
    constructor() {
        this.items = [];
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.productId === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ productId: product.id, quantity: 1 });
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
    }

    getItems() {
        return this.items;
    }

    clearCart() {
        this.items = [];
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
}

module.exports = CartModel;