// Carregando Módulos
const express = require('express')
const handlebars = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')

const passport = require('passport')
require('./config/auth')(passport)

require('./models/Postagem')
const Postagem = mongoose.model('postagens')

require('./models/Categoria')
const Categoria = mongoose.model('categorias')

const app = express()

// Configurações
/** Sessão */
app.use(session({
    secret: 'node',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

/** Midlewere */
app.use((req, res, next) => {
    res.locals.error = req.flash('error')
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.user = req.user || null
    next()
})

/** Body Parer */
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/** Handlebars */
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

/** Mongoose */
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/BlogAPP")
    .then(() => { console.log('Conectado ao banco de dados MongoDB.') })
    .catch(err => { console.log('Falha ao se conectar ao banco de bados: ' + err.message) })

/** Public */
app.use(express.static(__dirname + '/public'))

// Rotas
app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({ data: 'desc' })
        .then(postagens => { res.render('index', { postagens }) })
        .catch(err => {
            req.flash('error_msg', 'Houve um erro interno: ' + err)
            res.redirect('/404')
        }) 
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean()
        .then(postagem => { 
            if (postagem) { res.render('postagem/index', { postagem }) } 
            else { 
                req.flash('error_msg', 'Esta Postagem não existe.')
                res.redirect('/')
            }
        }).catch(() => { 
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
})

app.get('/categorias', (req, res) => {
    Categoria.find().lean()
        .then(categorias => { res.render('categoria/index', { categorias }) })
        .catch(() => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias.')
            render.redirect('/')
        })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean()
        .then((categoria) => {

            if (categoria) { 
                
                Postagem.find({ categoria: categoria._id }).lean()
                    .then(postagens => { res.render('categoria/postagens', { postagens, categoria }) })
                    .catch(() => {
                        req.flash('error_msg', 'Houve um erro ao carregar as postagens.')
                        render.redirect('/')
                    })

            } else {
                req.flash('error_msg', 'Esta categoria não existe.')
                render.redirect('/')
            }

        }).catch(() => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a pagina desta categoria.')
            render.redirect('/')
        })
})

app.get('/404', (req, res) => {
    res.send('Erro 404')
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)

// Outros


// Subindo Servidor
const PORT = process.env.POST || 8081
app.listen(PORT, () => { console.log('Rodando Servidor.') })