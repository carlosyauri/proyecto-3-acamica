const express = require("express");
const cors = require("cors"); 
const helmet = require("helmet");
const app = express();
const usuariosController = require("./Controller/usuariosController")
const productodController = require("./Controller/productorController")
const pedidosController = require("./Controller/pedidosController")
const db = require("./conexion")
const models = require("./models")



app.use(helmet());
app.use(express.json())
app.use(cors());
app.use("/usuarios", usuariosController);
app.use("/productos", productodController)
app.use("/pedidos", pedidosController)


db.init()
    .then(async () => {

        db.sequelize.sync({force: false}).then(()=>{
            console.log("Database Connected Succesfull…");
        }).catch(err=>{
            console.log(err);
        });

        console.log('Conectado a la Base de Datos');
        app.set("port", process.env.PORT || 3000);
        app.listen(app.get("port"), () => {
            console.log("Server on port", app.get("port"))
        })

    }).catch((err) => {
        console.log('Error al conectar a la db', err);
    });




models.pedidos.hasMany(models.detalle_pedidos)
models.detalle_pedidos.belongsTo(models.pedidos)
    
models.estados.hasMany(models.pedidos)
models.pedidos.belongsTo(models.estados)