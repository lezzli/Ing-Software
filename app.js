
//invocamos express
const express = require('express')
const app = express()
 //seteamos urlencoded para capturar datos
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//invocamos dotenv
const dotenv = require('dotenv')
//const request = require('express/lib/request')
dotenv.config({path:'./env/.env'})

//directorio public
app.use('/resources', express.static('public'))
app.use('/resources', express.static(__dirname + '/public'))

//directorio de plantillas
app.set('view engine', 'ejs')


// hashing de password

const bcryptjs = require('bcryptjs')

//var session
const session = require('express-session')

app.use(session({
    secret:'secret',
    resave:true,
    saveUnitialized:true
}))
 

// modulo de conexion
 const connection= require('./database/db')

 // estableciendo las rutas
// app.get('/', (req, res) =>{
//     res.render('index',{ msg:'este es un mensaje desde'})
// })
app.get('/login', (req, res) =>{
    res.render('login')
})
app.get('/register', (req, res) =>{
    res.render('register')
})

//registracion
app.post('/register',async(req, res) =>{
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    let passwordhash = await bcryptjs.hash(password, 8)

    connection.query('INSERT INTO USUARIOS SET ?' , {name:name, email:email, password:passwordhash} , async(error,results)=>{
        if(error){
            console.log(error)
        }else{
            req.session.loggedin = true
            req.session.name = name
            res.render('register',{
                alert: true,
                alertTitle: "Registro",
                alertMessage:"¡Registro Exitoso!",
                alertIcon: 'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
    })
 })


//autenticacion
app.post('/auth' , async(req, res) =>{
    const email = req.body.email
    const password = req.body.password
    let passwordhash = await bcryptjs.hash(password, 8);

    if(email && password){
        connection.query('SELECT * FROM usuarios WHERE email = ?' , [email], async ( error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(password, results[0].password))){
              res.render('login',{
                  alert:true,
                  alertTitle: "Error",
                  alertMessage: "Email y/o contraseña incorrectas",
                  alertIcon: "error",
                  showConfirmButton: true,
                  timer:false,
                  ruta: 'login'
              })
            }else{
                req.session.loggedin = true
                req.session.name = results[0].name
                res.render('login',{
                alert:true,
                alertTitle: "Conexion exitosa",
                alertMessage: "¡LOGIN CORRECTO!",
                alertIcon: "success",
                showConfirmButton: false,
                timer:1500,
                ruta: ''
            })
            }
        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle: "ADVERTENCIA",
            alertMessage: "Porfavor ingrese un email y/o contraseña",
            alertIcon: "warning",
            showConfirmButton: true,
            timer:false,
            ruta: 'login'
        })
    }
})

//auth pages
app.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name:req.session.name
        })
    }else{
        res.render('index',{
            login:false,
            name:'Debe iniciar sesión'
        })
    }
})
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})
app.listen(3000, ()=>{
    console.log('Server Up en http://localhost:3000 ')
})