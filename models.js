const conexion = require("./conexion")
const sequelize = conexion.sequelize
const {Model, DataTypes} = require('sequelize');


sequelize.define()

class productos extends Model {}
productos.init({
        id : {
               type: DataTypes.INTEGER,
               autoIncrement: true,
               primaryKey: true
        },
        nombre: DataTypes.STRING,
        descripcion: DataTypes.STRING,
        foto: DataTypes.STRING,
        stock: DataTypes.INTEGER,
        favorito: DataTypes.BOOLEAN,
        precio: DataTypes.FLOAT,

}, {
    sequelize,
    modelName: "Productos"
});

class usuario extends Model {}
usuario.init({
         id : {
               type: DataTypes.INTEGER,
               autoIncrement: true,
               primaryKey: true
          },
          usuario: DataTypes.STRING,
          nombre : DataTypes.STRING, 
          apellido: DataTypes.STRING, 
          email: DataTypes.STRING, 
          telefono: DataTypes.STRING, 
          direccion: DataTypes.STRING, 
          password: DataTypes.STRING,
          isadmin: DataTypes.BOOLEAN 

}, {
    sequelize,
    modelName: "Usuario"
});

class pedidos extends Model {}
pedidos.init({
        id_pedidos : {
               type: DataTypes.INTEGER,
               autoIncrement: true,
               primaryKey: true
        },
        forma_pago: DataTypes.STRING,
        total_pedido: DataTypes.FLOAT,
        usuario_id: DataTypes.INTEGER,
        nombre_usuario: DataTypes.STRING
}, {
    sequelize,
    modelName: "Pedidos"
});

class detalle_pedidos extends Model {}
detalle_pedidos.init({

        id_detalle : {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
        },
        producto_nombre: DataTypes.STRING,
        producto_cantidad: DataTypes.INTEGER,
        producto_precio: DataTypes.FLOAT
     
}, {
    sequelize,
    modelName: "Detalle_pedido"
});

class estados extends Model {}
estados.init({

        id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
        },
        
        estado: DataTypes.STRING,
     
}, {
    sequelize,
    modelName: "Estado"
});


module.exports = {usuario, productos, pedidos, detalle_pedidos, estados}
