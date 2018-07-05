class Cart {
	constructor({ items = {}, totalQty = 0, totalPrice = 0 } = {}) {
		this.items = items;
		this.totalQty = totalQty;
		this.totalPrice = totalPrice;
	}

	add(item, id) {
		let storedItem = this.items[id];

		if (!storedItem) {
			storedItem = this.items[id] = { item, qty: 0, price: 0 };
		}

		storedItem.qty++;
		storedItem.price = storedItem.item.price * storedItem.qty;

		this.totalQty++;
		this.totalPrice += storedItem.item.price;
	}

	reduceByOne(id) {
		this.items[id].qty--;
		this.items[id].price -= this.items[id].item.price;
		this.totalQty--;
		this.totalPrice -= this.items[id].item.price;

		if (this.items[id].qty <= 0) {
			delete this.items[id];
		}
	}

	removeItem(id) {
		this.totalQty -= this.items[id].qty;
		this.totalPrice -= this.items[id].price;
		delete this.items[id];
	}

	generateArray() {
		return Object.values(this.items);
	}
}

module.exports = Cart;
