import {promises as fs} from 'fs';
class ProductManager {

    constructor (productsFilePath) {
        this.path = productsFilePath;
        this.products = null;
    }

    async addProduct(product) {
        console.log(`Trying to add product with code ${product.code}`);
        
        try {

            if (!this.isProductComplete(product)) {
                throw new Error('The product is not complete.');
            }

            if (await this.getProductByCode(product.code)) {
                throw new Error(`A product with the same code has been found.`);
            }

            const products = await this.#getProductsArray();
            product.id = this.getNextId(products);
            products.push(product);

            await this.#writeProductsFile(products)
        } catch (error) {
            console.error(`\x1b[31mError:\x1b[0m Product not added. ${error.message}`);
        }

    }

    async updateProduct(id, product) {
        console.log(`Trying to update product with code ${product.code}`);
        
        try {

            if (!this.isProductComplete(product)) {
                throw new Error('The product is not complete.');
            }

            if (await this.getProductByCode(product.code)) {
                throw new Error(`A product with the same code has been found.`);
            }

            const products = await this.#getProductsArray();

            const productIndex = products.findIndex(product => product.id === id);
            if (!productIndex) {
                throw new Error(`Product with id ${id} not found.`);
            }

            // id replacement is not allowed
            product.id = id;
            products[productIndex] = product;

            await this.#writeProductsFile(products)
        } catch (error) {
            console.error(`\x1b[31mError:\x1b[0m Product not updated. ${error.message}`);
        }

    }

    async deleteProduct(id) {
        console.log(`Trying to delete product with id ${id}`);
        
        try {

            const products = await this.#getProductsArray();

            const productIndex = products.findIndex(product => product.id === id);
            if (!productIndex) {
                throw new Error(`Product with id ${id} not found.`);
            }

            products.splice(productIndex, 1);

            await this.#writeProductsFile(products)
        } catch (error) {
            console.error(`\x1b[31mError:\x1b[0m Product not deleted. ${error.message}`);
        }

    }

    getNextId (products) {
        let nextId = products.reduce((maxId, product) => {
            return product.id > maxId ? product.id : maxId;
        }, 0);
        return nextId + 1;
    }

    async getProducts() {
        console.log(`Trying to get array with all products`);
        const products = await this.#getProductsArray();
        return products;
    }

    async getProductById(id) {
        console.log(`Searching product with id ${id}`);
        const products = await this.#getProductsArray();
        const product = products.find(product => product.id === id)
        if (!product) {
            console.error('Not found');
        }
        return product;
    }

    async getProductByCode(code) {
        console.log(`Searching product with code ${code}`);
        const products = await this.#getProductsArray();
        const product = products.find(product => product.code === code)
        return product;
    }

    isProductComplete(product) {
        for (const prop in product) {
            if (!product[prop]) {
                return false;
            }
        }
        return true;
    }

    async #readProductsFile() {
        console.log(`Trying to read file with all products`);
        try {
            return await fs.readFile(this.path, 'utf8');
        } catch (error) {
            throw new Error(`Could not read from file ${this.path}`);
        }
    }

    async #writeProductsFile(products) {
        const productsString = JSON.stringify(products, null, '\t');
        try {
            return await fs.writeFile(this.path, productsString);
        } catch (error) {
            throw new Error (`Could not write to file ${this.path}`);
        }
    }

    async #getProductsArray() {
        if (this.products !== null) {
            return this.products;
        }
        this.products = [];
        try {
            const parsedJSON = JSON.parse(await this.#readProductsFile());
            if (!Array.isArray(parsedJSON)) {
                throw new Error();
            }
            this.products = parsedJSON;
        } catch (error) {
            console.error(`\x1b[31mError:\x1b[0m Could not parse array from ${this.path}`);
        }
        return this.products;
    }

}

export default ProductManager;