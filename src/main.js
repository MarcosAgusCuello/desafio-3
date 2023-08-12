import express from 'express';
import ProductManager from './clases/productManager.js';
import config from './config.js';

const PRODUCTS_FILE_PATH = config.PRODUCTS_FILE_PATH || './clases/products.json';

const productManager = new ProductManager(PRODUCTS_FILE_PATH);

const app = express();

app.use(express.json());

app.get('/products/', async (req, res) => {
    const products = await productManager.getProducts();
    const {limit} = req.query;

    if(/^\d+$/.test(limit)) {
        const productsLimit = +limit;
        const productsRange = products.slice(0, productsLimit);
        return res.send(productsRange);
    }
    
    res.send(products);
})

app.get('/products/:pid', async (req, res) => {
    const {pid} = req.params;

    const product = await productManager.getProductById(parseInt(pid));
    if (!product) {
        res.status(404).send({});
        return;
    }

    res.send(product);
})

const server = app.listen(config.PORT, () => { console.log(`Servidor escuchando en puerto ${config.PORT}`)});
server.on('error', error => console.log('Error al iniciar el servidor:', error.message));