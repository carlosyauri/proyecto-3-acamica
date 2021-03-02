const express = require("express");
const models = require("../models")
const router = express.Router();
const {datosRecibidos} = require("../middlewares");
const { datosLogin } = require("../middlewares");
const { validacionJwt} = require("../middlewares");



router.post ("/usuariosIniciales", async(req,res) => {

    const usuarios = await models.usuario.findAll()

    if (usuarios.length > 0) {
        return res.send('Ya se crearon los usuarios iniciales, no puedo volver a realizar esta acción.')
    }

    const nuevoUsuario = [
        {
            usuario: "Carlitos",
            nombre: "Carlos",
            apellido: "Yauri",
            email: "carlos@gmail.com",
            telefono: 000000000,
            direccion: "Av. acamica 123",
            password: "Carlos123!",
            isadmin: false
        },
        {
            usuario: "Mentor",
            nombre: "Profe",
            apellido: "Acamica",
            email: "mentor@gmail.com",
            telefono: 111111111,
            direccion: "Av. mentores 50",
            password: "Mentor123!",
            isadmin: true
        }
    ]

    nuevoUsuario.forEach(e => {
        models.usuario.create(e)
    });

    res.status(200).json({ 
        message: "Usuarios creados con exito", nuevoUsuario
    })

})
router.post("/", datosRecibidos, async (req,res) => {
    const {usuario, nombre,apellido,email,telefono,direccion,password,isadmin} = req.body
    const newUser = {
        usuario,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        password,
        isadmin
    }

   
    const usu = await models.usuario.create(newUser)
 
    if(usu) return res.status(200).json({
        message: "Usuario creado con exito", usu
    });

    res.status(400).json({
        message: "No se pudo crear el usuario"
    })



})

router.get("/", validacionJwt ,async (req,res) => {

    if(req.user.admin == false){

        const user = await models.usuario.findOne({
            where: {nombre: req.user.nombreUser}
        })
    
        return res.send(user)

    }

    const usuarios = await models.usuario.findAll();
    if(usuarios.length > 0) return res.status(200).json({
        message: "Operacion exitosa", usuarios
    });
    res.status(400).json({
        message: "No se encontraron usuarios registrados"
    })
})

router.get("/:id", validacionJwt ,async (req,res) => {

    if(req.user.admin == false){

        const user = await models.usuario.findOne({
            where: {nombre: req.user.nombreUser}
        })

        if (user.id == req.params.id){
            return res.status(200).json({message: "Operacion exitosa", user})

        }else{
            return res.status(401).json({message: "Usted no esta autorizado para ver la informacion de otro usuario"})
        }


    }

    const user = await models.usuario.findOne({
        where : {id: req.params.id }
    });

    if(user) return res.status(200).json({
        message: "Operacion exitosa", user
    });

    res.status(400).json({
        message: "No se encontro usuarios registrado con ese ID"
    })
})



router.put('/:id', validacionJwt, async(req,res) =>{

    if(req.user.admin == false){

        const user = await models.usuario.findOne({
            where: {nombre: req.user.nombreUser}
        })

        if (user.id == req.params.id){

            const actualizarUsuario = await models.usuario.update(req.body,{
                where : {id: req.params.id}
            });
        
            if(actualizarUsuario) return res.status(200).json({message: "Actualizado con exito"});
            res.status(400).json({
                message: `No se encontro usuario con el ID: ${req.params.id}`
            });

        }else{
            return res.status(401).json({message: "Usted no esta autorizado para actualizar la informacion de otro usuario"})
        }   

    }else{
        return res.status(401).json({message: "Usted no esta autorizado. Solo los usuarios pueden cambiar su informacion personal"})
    }


})


router.delete('/:id', validacionJwt, async(req, res) =>{

    if(req.user.admin == false){
        res.status(401).json({message: "No estas autorizado"})
        return
    }

    const borrarUsuario = await models.usuario.destroy({
        where : {id: req.params.id}
    })

    if(borrarUsuario) return res.status(200).json({ message: "Eliminado con exito"});
    res.status(400).json({
        message: `No se encontro usuario con el ID: ${req.params.id}`
    })
})

router.post('/login', datosLogin, (req, res) => {
     res.status(200).json({
            message: "Operacion exitosa",
            exito: {
                token: req.token,
                usuario: req.email
                }
            })
    
})


module.exports = router;