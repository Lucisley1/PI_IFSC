const Pessoa = require("../models/pessoa")
const Endereco = require("../models/endereco")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const passport = require("passport")
require("dotenv").config()
const segredo = process.env.JWT_TOKEN

const controller = {}

controller.getLoginPage = async (req, res) => {
    try {
        res.status(200).render("pessoas/login")
    } catch (error) {
        res.status(500).render("pages/error", { error: "Erro ao carregar o formulário!" })
    }
}

controller.getRegisterPage = async (req, res) => {
    try {
        res.status(200).render("pessoas/form", {
            pessoa: new Pessoa()
        })
    } catch (error) {
        res.status(500).render("pages/error", { error: "Erro ao carregar o formulário!" })
    }
}

controller.getUpdatePage = async (req, res) => {
    const { pessoaId } = req.params
    try {
        const pessoa = await Pessoa.findByPk(pessoaId, {
            include: Endereco,
        })

        if (!pessoa) {
            return res.status(500).render("pages/error", { error: "Pessoa não existe!" })

        }

        res.status(200).render("pessoas/edit", {
            pessoa: pessoa
        })
    } catch (error) {
        res.status(500).render("pages/error", { error: "Erro ao carregar o formulário!" })
    }
}

controller.logar = async (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/form-login",
        failureFlash: true
    }
    )(req, res, next)
}

controller.logout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) { 
            return next(err)
        }
        req.flash('success_msg',"Você saiu!")
        res.redirect('/')
    })
    
}

controller.getAll = async (req, res) => {
    try {
        const pessoas = await Pessoa.findAll({
            include: Endereco
        })
        res.status(200).render("pessoas/index", {
            pessoas: pessoas
        })
    } catch (error) {
        res.status(500).render("pages/error", { error: "Erro ao buscar por pessoas!" })
    }
}

controller.getById = async (req, res) => {
    const { pessoaId } = req.params

    try {
        const pessoa = await Pessoa.findByPk(pessoaId, {
            include: Endereco,
        })

        if (!pessoa) {
            return res.status(422).render("pages/error", { error: "Usuário não existe!" })
        }

        res.status(200).render("pessoas/show", {
            pessoa: pessoa
        })
    } catch (error) {
        res.status(422).render("pages/error", { error: "Erro ao buscar usuário!" })
    }
}

controller.create = async (req, res) => {
    const { nome, username, password,cpf,telefone,data_nasc, role, rua,complemento,cidade,estado } = req.body

    try {
        const hashDaSenha = await bcrypt.hash(password, 10);
        const pessoa = await Pessoa.create({ nome, username, password: hashDaSenha,cpf,telefone,data_nasc, role })
        await Endereco.create({ rua,complemento,cidade,estado, pessoaId: pessoa.id })
        res.status(200).redirect(`/form-login`)
    } catch (error) {
        res.status(422).render("pages/error", { error: "Erro ao cadastar usuário!" + error })
    }
}

controller.update = async (req, res) => {
    const { pessoaId } = req.params
    const { nome, rua, cidade } = req.body

    try {
        const pessoa = await Pessoa.findByPk(pessoaId)

        if (!pessoa) {
            return res.status(422).render("pages/error", { error: "Usuário não existe!" })
        }

        pessoa.nome = nome
        await pessoa.save()

        const endereco = await Endereco.findOne({
            where: {
                pessoaId: pessoaId
            }
        })

        if (!endereco) {
            return res.status(422).render("pages/error", { error: "Endereço não existe!" })
        }

        endereco.rua = rua
        endereco.cidade = cidade
        await endereco.save()

        res.status(200).redirect(`/pessoas/${pessoa.id}`)
    } catch (error) {
        return res.status(422).render("pages/error", { error: "Erro ao atualizar o usuário!" })
    }
}

controller.delete = async (req, res) => {
    const { pessoaId } = req.params
    try {
        const pessoa = await Pessoa.findByPk(pessoaId)
        await pessoa.destroy()
        res.status(200).redirect("/pessoas")
    } catch (error) {
        return res.status(422).render("pages/error", { error: "Erro ao remover o usuário!" })
    }
}

module.exports = controller