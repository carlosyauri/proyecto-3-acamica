const express = require("express");
const { stat } = require("fs");
const models = require("../models")
const router = express.Router();

const { validarProductos, validacionJwt} = require("../middlewares");
const e = require("express");



router.post("/productosIniciales", async (req,res) => {

    const productos = await models.productos.findAll()

    if (productos.length > 0) {
        return res.send('Ya se crearon los productos iniciales, no puedo volver a realizar esta acción.')
    }

    const nuevoProducto = [
        
        {
            nombre: "Hamburguesa Simple",
            descripcion: "Pan de papa, UN medallon de carnes de 100gr, cheddar, toppings a eleccion y porcion de papas",
            foto: "https://images3.alphacoders.com/922/922680.jpg",
            stock: "3000",
            favorito: "false",
            precio: "300",
        },
        {
            nombre: "Hamburguesa Doble",
            descripcion: "Pan de papa, DOS medallones de carnes de 100gr, cheddar, toppings a eleccion y porcion de papas",
            foto: "https://pbs.twimg.com/media/EM1m9p_UcAESoHj?format=jpg&name=900x900",
            stock: "3000",
            favorito: "true",
            precio: "350",
        },
        {
            nombre: "Hamburguesa Triple",
            descripcion: "Pan de papa, TRES medallones de carnes de 100gr, cheddar, toppings a eleccion y porcion de papas",
            foto: "https://pbs.twimg.com/media/EM1m9p_UcAESoHj?format=jpg&name=900x900",
            stock: "3000",
            favorito: "true",
            precio: "400",
        },

    ]

    nuevoProducto.forEach(e => {
        models.productos.create(e)        
    });
    
    res.status(200).json({ 
        message: "Productos creados con exito", nuevoProducto
    })

    const nuevosEstados = [
        {
            id: 1,
            estado: "Iniciado"
        },
        {
            id: 2,
            estado: "En preparacion"
        },
        {
            id: 3,
            estado: "Enviando"
        },
        {
            id: 4,
            estado: "Entregado"
        },
        {
            id: 5,
            estado: "Finalizado exitosamente"
        },
        {
            id: 6,
            estado: "Finalizado por cancelacion"
        }
    ]

    nuevosEstados.forEach(e => {
        models.estados.create(e)
    });

})

router.post("/", validacionJwt, validarProductos, async (req,res) => {

    if(req.user.admin == false){
        res.send("No estas autorizado")
        return
    }

    const {nombre,descripcion,foto,stock,favorito,precio} = req.body
    const newProducto = {
        nombre,
        descripcion,
        foto,
        stock,
        favorito,
        precio
    }

  
    const producto = await models.productos.create(newProducto)
    
    if(producto) return res.status(200).json({message:"Operacion exitosa", producto});

    res.status(400).json({
        message: "No se pudo crear el producto"
    })


})

router.get("/", validacionJwt, async(req,res) => {

    const produc = await models.productos.findAll();
    if (produc.length > 0) return res.status(200).json({
        message: "Operacion exitosa", produc});
    res.status(400).json({
        message: "No se encontraron productos"
    })

})

router.put('/:id', validacionJwt, async(req,res) =>{

    if(req.user.admin == false){
        res.status(401).json({message: "No estas autorizado"})
        return
    }
    const actualizarProducto = await models.productos.update(req.body,{
        where : {id: req.params.id}
    });

    console.log(actualizarProducto)

    if(actualizarProducto == true) return res.status(200).json({message: "Producto actualizado con exito"});

    res.status(400).json({
        message: `No se encontro el producto con el ID: ${req.params.id}`
    });

})


router.delete('/:id', validacionJwt, async(req, res) =>{

    if(req.user.admin == false){
        res.status(401).json({message: "No estas autorizado"})
        return
    }

    const borrarProducto = await models.productos.destroy({
        where : {id: req.params.id}
    })

    if(borrarProducto) return res.status(200).json({ message: `Producto con ID ${req.params.id}, eliminado con exito`});
    res.status(400).json({
        message: `No se encontro producto con el ID: ${req.params.id}`
    })
})

module.exports = router