const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const router = express.Router()

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {

    if (req.body.senha.length < 6) {
        res.render('usuarios/registro', { erro: 'Senha muito pequena, no mínimo 6 letras.' })

    } else if (req.body.senha != req.body.senha2) {
        res.render('usuarios/registro', { erro: 'Senhas não condizem.' })

    } else {

        Usuario.findOne({ email: req.body.email })
            .then(usuario => {
                if (usuario) {
                    req.flash('error_msg', 'Este e-mail já foi cadastrado.')
                    res.redirect('/usuarios/registro')
                } else {

                    const novoUsuario = new Usuario({
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha
                    })

                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if (erro) {
                                req.flash('error_msg', 'Houve um erro durante o salvamento do usuario.')
                                res.redirect('/')
                            }

                            novoUsuario.senha = hash

                            novoUsuario.save()
                                .then(() => {
                                    req.flash('success_msg', 'Usuario criado.')
                                    res.redirect('/')
                                }).catch(() => {
                                    req.flash('error_msg', 'Houve um erro ao cirar o usuario.')
                                    res.redirect('/usuarios/registro')
                                })
                        })
                    })

                }
            }).catch(() => {
                req.flash('error_msg', 'Houve um erro.')
                res.redirect('/')
            })
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Você foi deslogado.')
    res.redirect('/')
})

module.exports = router