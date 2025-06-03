class ProductModel {
    constructor(id, name, price, quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    getDetails() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            quantity: this.quantity
        };
    }
}

module.exports = ProductModel;