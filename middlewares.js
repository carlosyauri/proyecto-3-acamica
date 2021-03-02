require("dotenv").config();
const jwt = require("jsonwebtoken");
var jwtClave = process.env.JWT_PASSWORD 
 
const models = require("./models");

const db = require("./conexion.js")

const datosLogin = async (req, res, next) => {
    const {email, password } = req.body

    if (!email || !password) {
        res.status(400).json({
            error: 'faltan campos'
        })
    }
    let access = await validateUser(email, password)
    if (access) {
        req.token = access.codigoToken
        req.email = access.email
        next();
    }

    else {
        res.status(401).json({
        
            error: "email o password invalidas"
            
        })
    }
}
//validacion JWT

const validacionJwt = (req, res, next) => {
    const codigoToken = req.headers.authorization.split(' ')[1];
    jwt.verify( codigoToken, jwtClave, (err, decoded) => {
        if (err) { 
            res.send('No está autorizado');
        }
        req.user = decoded;
        next()
    });
}

//Creamos el endpoint para el login 
function tokenGenerado(nombre, isadmin) {

    const payload = {
        nombreUser: nombre,
        admin: isadmin
    } 
    
    var token = jwt.sign(payload, jwtClave);
 
    //envio Token
    return token
}

// 8 caracteres con (MAYUS, MINUS, NUM y Caracter)
function validarClave(password) {
    if (password.length >= 8) {
        var mayuscula = false;
        var minuscula = false;
        var numero = false;
        var caracter_raro = false;

        for (var i = 0; i < password.length; i++) {
            if (password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90) {
                mayuscula = true;
            }
            else if (password.charCodeAt(i) >= 97 && password.charCodeAt(i) <= 122) {
                minuscula = true;
            }
            else if (password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57) {
                numero = true;
            }
            else {
                caracter_raro = true;
            }
        }
        if (mayuscula == true && minuscula == true && caracter_raro == true && numero == true) {
            return true;
        }
    }
    return false;
}



function validarEmail(valor) {

    if (/^([\da-z_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(valor)) {
        return true
    } else {
        return false
    }
}


const validateUser = async (email, password) => {

    const userSelected = await models.usuario.findOne({
        where : {email: email}

    })

    if (userSelected) {
        if (userSelected.password == password.trim()) {
            codigoToken = tokenGenerado(userSelected.nombre, userSelected.isadmin)
            const email = {nombre: userSelected.nombre, isadmin: userSelected.isadmin}
            return {codigoToken, email};

        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}



const datosRecibidos = (req, res, next) => {
    const {usuario, nombre, apellido, email, telefono, direccion, password } = req.body;
    if (! usuario || !nombre || !apellido || !email || ! telefono || ! direccion || !password) {
        return res.status(400).json({
            error: 'faltan campos'
        })
    }
    if (isNaN(telefono)) {
        return res.status(400).json({
            error: 'Edad incorrecto'
        })
    }
    if (validarEmail(email) === false) {
        return res.status(400).json({
            error: 'Email incorrecto'
        })
    }
    if (validarClave(password) === false) {
        return res.status(400).json({
            error: 'Password incorrecto'
        })
    }

    next()
}

const validarProductos = (req, res, next) => {
    const {nombre, descripcion, foto, stock, favorito, precio } = req.body;
    if ( !nombre || !descripcion || !foto || !stock || !favorito || !precio ) {
        return res.status(400).json({
            error: 'faltan campos. por favor completar'
        })
    }
    next()
}

const validarPedido = (req, res, next) => {
    const {forma_pago } = req.body;
    if ( !forma_pago ) {
        return res.status(400).json({
            error: 'faltan campos. por favor completar'
        })
    }

    next()
}





module.exports = { datosRecibidos, datosLogin, validacionJwt, validarClave, validarEmail,validateUser, validarProductos, validarPedido };
