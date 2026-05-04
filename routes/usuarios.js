const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { adminOnly } = require('../middleware/roleCheck');
const auth = require('../middleware/auth');

router.post("/register-admin", auth, adminOnly, async (req, res) => {
    try {
        const { email, senha, cpf } = req.body;

        let usuarioExiste = await Usuario.findOne({ $or: [{ email }, { cpf }] });
        if (usuarioExiste) {
            return res.status(400).json({ msg: "Usuário ou CPF já cadastrado." });
        }

        const hash = await bcrypt.hash(senha, 10);

        const novoAdmin = new Usuario({
            email,
            senha: hash,
            cpf,
            cargo: 'admin'
        });

        await novoAdmin.save();
        res.status(201).json({ msg: "Novo administrador cadastrado com sucesso!" });
    } catch (err) {
        res.status(500).json({ msg: "Erro ao criar administrador." });
    }
});

router.post("/register", async (req, res) => {
    try {
        // AGORA ELE PEGA O NOME QUE VEM DO FRONT-END!
        const { nome, email, senha, cpf } = req.body;

        if (!email || !senha || !cpf) {
            return res.status(400).json({ msg: "Por favor, preencha todos os campos." });
        }

        let usuarioExiste = await Usuario.findOne({ cpf });
        if (usuarioExiste) {
            return res.status(400).json({ msg: "CPF já cadastrado." });
        }

        usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ msg: "E-mail já cadastrado." });
        }

        const hash = await bcrypt.hash(senha, 10);

        const usuario = new Usuario({
            nome, // SALVANDO O NOME NO BANCO DE DADOS
            email,
            senha: hash,
            cpf
        });

        await usuario.save();

        res.status(201).json({
            _id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            cpf: usuario.cpf
        });
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        res.status(500).json({
            msg: "Erro no servidor ao registrar usuário.",
            erro: err.message
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ msg: "Por favor, forneça e-mail e senha." });
        }

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(400).json({ msg: "Usuário não encontrado." });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(400).json({ msg: "Senha inválida." });
        }

        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            usuario: {
                _id: usuario._id,
                nome: usuario.nome, // O Front-end agora sabe o nome na hora do login
                email: usuario.email,
                cpf: usuario.cpf,
                cargo: usuario.cargo
            }
        });
    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.status(500).json({
            msg: "Erro no servidor ao fazer login.",
            erro: err.message
        });
    }
});

// ATUALIZADO: Agora ele envia o nome na lista de todos também
router.get("/todos", async (req, res) => {
    try {
        const usuarios = await Usuario.find().select("nome email cpf cargo createdAt updatedAt");

        res.json(usuarios);
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).json({
            msg: "Erro no servidor ao listar usuários.",
            erro: err.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de usuário inválido." });
        }

        const usuario = await Usuario.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        return res.json({ msg: "Usuário excluído com sucesso." });
    } catch (err) {
        console.error("Erro ao excluir usuário:", err);
        res.status(500).json({
            msg: "Erro no servidor ao excluir usuário.",
            erro: err.message
        });
    }
});

module.exports = router;