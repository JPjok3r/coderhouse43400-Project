import { productService } from "../services/products.service.js";

class ProductController{
    async getProducts(req, res) {
        try {
            const products = await productService.getAll(req.query);
            res.status(200).json({products});
        } catch (error) {
            res.status(500).json({error});
        }
    }
    
    async getProductById(req, res) {
        const { pId } = req.params;
        try {
            const product = await productService.getById(pId);
            if(product)
                res.status(200).json({ message: `Product ${pId}`, product});
            else
                res.status(200).json({ message: `Error`, product});
        } catch (error) {
            res.status(500).json({error});
        }
    }
    
    async createProduct(req, res) {
        const { title, description, code, price, status=true, stock, category, thumbnails=[] } = req.body;
        try {
            if(title && description && code && price && stock && category){
                let sendData = {
                    title,
                    description,
                    price,
                    code,
                    stock,
                    category,
                    status,
                    thumbnails
                }
                if(req.session.user.rol === 'premium'){
                    sendData = {...sendData, owner: req.session.user.email}
                } 
                const newProduct = await productService.create(sendData);
                logger.http('Estado correcto, codigo 200');
                logger.debug('Ejecucion valida');
                res.status(200).json({message: "Producto creado exitosamente", product: newProduct});
            } else{
                res.status(400).json({message: 'Error, todos los campos son obligatorios.'})
            }
        } catch (error) {
            res.status(500).json({error});
        }
    }
    
    async updateProduct(req, res) {
        const { pId } = req.params;
        try {
        let product;
            if(req.session.user.rol === 'premium'){
                product = await productService.update(pId, req.body, req.session.user.email);
            } else{
                product = await productService.update(pId, req.body);
            }
            res.status(200).json({ message: product });
        } catch (error) {
            res.status(500).json({error});
        }
    }
    
    async delProduct(req, res) {
        const { pId } = req.params;
        try {
            //let response;
            //if(req.session.user.rol === 'premium'){
            //    response = await productService.deleteProduct(pId, req.session.user.email);
            //} else{
            //}
            const response = await productService.deleteProduct(pId);
            res.status(200).json({ message: response });
        } catch (error) {
            res.status(500).json({error});
        }
    }
}

export const productController = new ProductController();