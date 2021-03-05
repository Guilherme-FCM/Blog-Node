const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
require('../models/Categoria')
require('../models/Postagem')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')

const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().then(categorias => {
        res.render('admin/categorias', { categorias: categorias.map(categoria => categoria.toJSON()) })
    }).catch(() => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias. Tente novamente mais tarde.')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addCategoria')
})

router.post('/categorias/novaCategoria', eAdmin, (req, res) => {

    if (req.body.nome.length < 2) {
        res.render('admin/addCategoria', { erro: "Nome da categoria muito pequeno." })

    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save()
            .then(() => { req.flash('success_msg', 'Categoria registrada com sucesso.') })
            .catch(() => { req.flash('error_msg', 'Erro ao registrar esta categoria. Tente novamente mais tarde.') })
            .finally(() => { res.redirect('/admin/categorias') })
    }

})

router.post('/categorias/editar', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).lean()
        .then(categoria => { res.render('admin/editCategoria', { categoria }) })
        .catch(() => {
            req.flash('error_msg', 'Esta categoria não existe.')
            res.redirect('/admin/categorias')
        })

})

router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id })
        .then((categoria) => {

            if (req.body.nome.length < 2) {
                res.render('admin/addCategoria', { erro: "Nome da categoria muito pequeno." })

            } else {

                categoria.nome = req.body.nome
                categoria.slug = req.body.slug

                categoria.save()
                    .then(() => { req.flash('success_msg', 'Categoria editada com sucesso.') })
                    .catch(() => { req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria.') })
                    .finally(() => { res.redirect('/admin/categorias') })
            }

        }).catch(() => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria.')
            res.redirect('/admin/categorias')
        })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id })
        .then(() => { req.flash('success_msg', 'Categoria deletada com sucesso.') })
        .catch(() => { req.flash('error_msg', 'Houve um erro ao deletar a categoria.') })
        .finally(() => { res.redirect('/admin/categorias') })
})

router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().lean().populate('categoria').sort({ data: 'desc' })
        .then(postagens => { res.render('admin/postagens', { postagens }) })
        .catch(() => {
            req.flash('error_msg', 'Houve um erro na listagem das postagens.')
            res.redirect('/admin')
        })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().lean()
        .then(categorias => { res.render('admin/addPostagem', { categorias }) })
        .catch(() => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário.')
            res.redirect('/admin')
        })
})

router.post('/postagens/novaPostagem', eAdmin, (req, res) => {

    if (req.body.categoria == '0') {
        res.render('admin/addPostagem', { erro: "Categoria inválida. Registre uma categoria." })

    } else {

        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save()
            .then(() => { req.flash('success_msg', 'Postagem criada com sucesso.') })
            .catch(() => { req.flash('error_msg', 'Houve um erro durante o salvamento da postagem.') })
            .finally(() => { res.redirect('/admin/postagens') })
    }

})

router.post('/postagens/editar', eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.body.id }).lean()
        .then((postagem) => {

            Categoria.find().lean()
                .then((categorias) => { res.render('admin/editPostagem', { categorias, postagem }) })
                .catch(() => {
                    req.flash('error_msg', 'Houve um erro na listagem de categorias.')
                    res.redirect('/admin/postagens')
                })

        }).catch(() => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição.')
            res.redirect('/admin/postagens')
        })
})

router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.body.id })
        .then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save()
                .then(() => { req.flash('success_msg', 'Postagem editada com sucesso.') })
                .catch(() => { req.flash('error_msg', 'Houve um erro interno durante a edição da postagem.')})
                .finally(() => { res.redirect('/admin/postagens') })

        }).catch(() => { 
            req.flash('error_msg', 'Houve um erro ao salvar a edição') 
            res.redirect('/admin/postagens')
        })
})

router.post('/postagens/deletar', eAdmin, (req, res) => {
    Postagem.remove({ _id: req.body.id })
        .then(() => { req.flash('success_msg', 'Postagem deletada com sucesso.') })
        .catch(() => { req.flash('error_msg', 'Houve um erro interno ao deletar a postagem.') })
        .finally(() => { res.redirect('/admin/postagens') })
})

module.exports = router