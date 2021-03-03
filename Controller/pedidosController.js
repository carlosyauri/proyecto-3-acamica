const express = require("express");
const { validacionJwt, validarPedido } = require("../middlewares");
const router = express.Router();
const models = require("../models")



router.post("/", validacionJwt, validarPedido, async (req,res) => {


        const {id_producto, cantidad, forma_pago} = req.body

        const user = await models.usuario.findOne({
            where: {nombre: req.user.nombreUser}
        })

        var total_pedido = 0

        let array_consulta = Array.isArray(cantidad);
        
        if(array_consulta){

            for ( let i = 0; i < cantidad.length ; i ++){


                const product = await models.productos.findOne({
                    where: { id: id_producto[i] }
                })
    
                total_pedido += (product.precio*cantidad[i])
    
                const stockNuevo = product.stock - cantidad[i];
    
                if(stockNuevo <= 0){
    
                    return res.send(`El stock de ${product.nombre} es menor a la cantidad del pedido.`)
                }
    
                await models.productos.update({"stock": stockNuevo},{
                    where : {id: id_producto[i]}
                })
    
                const new_detalle = {
                    producto_nombre: product.dataValues.nombre,
                    producto_cantidad: cantidad[i],
                    producto_precio: product.dataValues.precio
                }
    
                await models.detalle_pedidos.create(new_detalle)
    
            }

        }

        else{

            const product = await models.productos.findOne({
                where: {id: id_producto}
            })

            total_pedido += (product.precio*cantidad)

            const stockNuevo = product.stock - cantidad;

            if(stockNuevo <= 0){

                return res.send(`El stock de ${product.nombre} es menor a la cantidad del pedido.`)
            }

            await models.productos.update({"stock": stockNuevo},{
                where : {id: id_producto}
            })

            const new_detalle = {
                producto_nombre: product.dataValues.nombre,
                producto_cantidad: cantidad,
                producto_precio: product.dataValues.precio
            }

            await models.detalle_pedidos.create(new_detalle)
        }

       

        const newPedido = {
            forma_pago: forma_pago,
            total_pedido: total_pedido,
            usuario_id: user.id,
            nombre_usuario: user.nombre,
            EstadoId: 1
        }
        

        const pedido_realizado = await models.pedidos.create(newPedido)

        await models.detalle_pedidos.update({PedidoIdPedidos: pedido_realizado.id_pedidos},{
            where : {PedidoIdPedidos: null}
        });


        if (pedido_realizado) return res.status(200).json({message: "Pedido creado exitosamente", pedido_realizado});
        res.status(400).json({
            message: "No se pudo realizar el pedido"
        })



})

router.get("/", validacionJwt, async(req, res) => {

    if(req.user.admin == false){

        const usuario_no_admin = await models.usuario.findOne({
            where : {nombre: req.user.nombreUser}
        })

        const pedido_personal = await models.pedidos.findAll({
            
            where : {usuario_id: usuario_no_admin.id},
            attributes: ["id_pedidos", "forma_pago", "total_pedido", "usuario_id", "nombre_usuario"],
            include: [
                {
                    model: models.detalle_pedidos,
                    require: true,
                    attributes: ["id_detalle", "producto_nombre", "producto_cantidad", "producto_precio"],
                },
                {
                    model: models.estados,
                    require: true,
                    attributes: ["estado"],
                }
            ]
        })

        if(pedido_personal) res.status(200).json({message: "Operacion exitosa", pedido_personal})
        return res.status(400).json({ 
            message: "No se encontraron pedidos"
        })
    }

    const allPedidos = await models.pedidos.findAll({
        attributes: ["id_pedidos", "forma_pago", "total_pedido", "usuario_id", "nombre_usuario"],
        include: [
            {
                model: models.detalle_pedidos,
                require: true,
                attributes: ["id_detalle", "producto_nombre", "producto_cantidad", "producto_precio"],
            },
            {
                model: models.estados,
                require: true,
                attributes: ["estado"],
            }
        ]
        });

    if (allPedidos.length > 0) return res.status(200).json({message: "Operacion exitosa", allPedidos});
    return res.status(400).json({ 

        message: "No se encontraron pedidos"

    })
     
})

router.put('/:id', validacionJwt, async(req,res) => {

    if(req.user.admin == false){
        return res.status(401).json({message: "No estas autorizado"})
    }

    //////// CAMBIAR SI EXISTE BODY

    const {id_estado} = req.body

    if(id_estado){

        const pedido = await models.pedidos.findOne({
            where : {id_pedidos: req.params.id}
        })
        
        if(pedido){

            const estadoAnterior = await models.estados.findOne({
                where : {id: pedido.EstadoId}
            })
    
            await models.pedidos.update({"EstadoId": id_estado},{
                where : {id_pedidos: req.params.id}
            });

            const pedidoActualizado = await models.pedidos.findOne({
                where : {id_pedidos : req.params.id}
            })
    
            const estadoNuevo = await models.estados.findOne({
                where : {id: pedidoActualizado.EstadoId}
            })

            if(estadoNuevo) return res.status(200).json({
                message: `Estado actualizado con exito.
                El estado del pedido ${req.params.id} paso de "${estadoAnterior.estado}" a "${estadoNuevo.estado}" `
            }) 
        }else {
            return res.status(400).json({
                message: `Error al actualizar estado.
                MOTIVO: El pedido ${req.params.id} no existe`
            })
        }

    }

    ////////// CAMBIAR SI NO HAY BODY
        const pedido = await models.pedidos.findOne({
            where : {id_pedidos : req.params.id}
        })

        if(pedido){


            const estadoAnterior = await models.estados.findOne({
                where : {id: pedido.EstadoId}
            })


            if(estadoAnterior.id == 5 || estadoAnterior.id == 6){
                return res.status(201).json({message: "El estado de su pedido ya esta finalizado."})
            }
    
            await models.pedidos.update({"EstadoId": (pedido.EstadoId+1)},{
                where : {id_pedidos: req.params.id}
            });

            const pedidoActualizado = await models.pedidos.findOne({
                where : {id_pedidos : req.params.id}
            })


            const estadoNuevo = await models.estados.findOne({
                where : {id: pedidoActualizado.EstadoId}
            })
    
            if(estadoNuevo) return res.status(200).json({
                message: `Estado actualizado con exito.
                El estado del pedido ${req.params.id} paso de "${estadoAnterior.dataValues.estado}" a "${estadoNuevo.dataValues.estado}" `
            }) 

        }else{
            return res.status(400).json({
                message: `Error al actualizar estado.
                MOTIVO: El pedido ${req.params.id} no existe`
            })
        }
        

})

router.delete("/:id", validacionJwt, async(req, res) => {

    if(req.user.admin == false){
        return res.status(401).json({message: "No estas autorizado"})
    }

    const eliminarPedido = await models.pedidos.destroy({
        where: {id_pedidos: req.params.id}
    })


    if(eliminarPedido) return res.status(200).json({ message: `Pedido con ID ${req.params.id}, eliminado con exito`});
    res.status(400).json({
        message: `No se encontro pedido con el ID: ${req.params.id}`
    })


})
        

        


module.exports = router