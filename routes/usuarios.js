const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { adminOnly } = require("../middleware/roleCheck");
const auth = require("../middleware/auth");

const isProduction = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USUARIO,
    pass: process.env.EMAIL_SENHA
  }
});

router.post("/register-admin", auth, adminOnly, async (req, res) => {
  try {
    const { email, senha, cpf } = req.body;

    if (!email || !senha || !cpf) {
      return res.status(400).json({ msg: "Por favor, preencha todos os campos." });
    }

    const cpfNormalizado = String(cpf).replace(/\D/g, "");
    const emailMinusculo = String(email).toLowerCase().trim();

    const usuarioExiste = await Usuario.findOne({ 
      $or: [{ email: emailMinusculo }, { cpf: cpfNormalizado }] 
    });

    if (usuarioExiste) {
      return res.status(400).json({ msg: "Usuário ou CPF já cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 12);

    const novoAdmin = new Usuario({
      email: emailMinusculo,
      senha: hash,
      cpf: cpfNormalizado,
      cargo: "admin"
    });

    await novoAdmin.save();
    res.status(201).json({ msg: "Novo administrador cadastrado com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro interno ao criar administrador." });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, cpf } = req.body;

    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({ msg: "Por favor, preencha todos os campos." });
    }

    const cpfNormalizado = String(cpf).replace(/\D/g, "");
    const emailMinusculo = String(email).toLowerCase().trim();

    const cpfExiste = await Usuario.findOne({ cpf: cpfNormalizado });
    if (cpfExiste) {
      return res.status(400).json({ msg: "CPF já cadastrado." });
    }

    const emailExiste = await Usuario.findOne({ email: emailMinusculo });
    if (emailExiste) {
      return res.status(400).json({ msg: "E-mail já cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 12);

    const usuario = new Usuario({
      nome: String(nome).trim(),
      email: emailMinusculo,
      senha: hash,
      cpf: cpfNormalizado,
      cargo: "cliente"
    });

    await usuario.save();

    res.status(201).json({
      _id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf
    });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao registrar usuário." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ msg: "Por favor, forneça e-mail e senha." });
    }

    const emailMinusculo = String(email).toLowerCase().trim();
    const usuario = await Usuario.findOne({ email: emailMinusculo });

    if (!usuario) {
      return res.status(400).json({ msg: "E-mail ou senha incorretos." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ msg: "E-mail ou senha incorretos." });
    }

    const tempoExpiracao = usuario.cargo === "admin" ? "1d" : "30d";

    const token = jwt.sign(
      { id: usuario._id, cargo: usuario.cargo },
      process.env.JWT_SECRET,
      { expiresIn: tempoExpiracao }
    );

    res.json({
      token,
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        cargo: usuario.cargo
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao processar o login." });
  }
});

router.get("/todos", auth, adminOnly, async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("nome email cpf cargo createdAt updatedAt");
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao listar usuários." });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de usuário inválido." });
    }

    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    res.json({ msg: "Usuário excluído com sucesso." });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao excluir usuário." });
  }
});

router.post("/esqueci-senha", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: "Por favor, informe o e-mail." });
    }

    const emailMinusculo = String(email).toLowerCase().trim();
    const usuario = await Usuario.findOne({ email: emailMinusculo });

    if (!usuario) {
      return res.status(404).json({ msg: "E-mail não encontrado em nossa base." });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    usuario.resetToken = codigo;
    usuario.resetTokenExpiracao = Date.now() + 3600000;
    await usuario.save();

    const mailOptions = {
      from: process.env.EMAIL_USUARIO,
      to: usuario.email,
      subject: "IzeJet - Código de Recuperação de Senha",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Recuperação de Senha</h2>
          <p>Olá, ${usuario.nome || "Cliente"}!</p>
          <p>Você solicitou a redefinição da sua senha. Use o código de 6 dígitos abaixo no aplicativo:</p>
          <h1 style="background-color: #F1F5F9; padding: 15px; letter-spacing: 5px; color: #0D253F; border-radius: 10px; display: inline-block;">
            ${codigo}
          </h1>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Este código é válido por 1 hora. Se você não solicitou, ignore este e-mail.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "E-mail de recuperação enviado com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro ao tentar enviar o e-mail de recuperação." });
  }
});

router.post("/redefinir-senha", async (req, res) => {
  try {
    const { email, token, novaSenha } = req.body;

    if (!email || !token || !novaSenha) {
      return res.status(400).json({ msg: "Preencha todos os campos obrigatórios." });
    }

    const emailMinusculo = String(email).toLowerCase().trim();
    const usuario = await Usuario.findOne({
      email: emailMinusculo,
      resetToken: String(token).trim(),
      resetTokenExpiracao: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ msg: "Código inválido ou já expirado. Solicite novamente." });
    }

    const hash = await bcrypt.hash(novaSenha, 12);
    usuario.senha = hash;
    usuario.resetToken = undefined;
    usuario.resetTokenExpiracao = undefined;

    await usuario.save();
    res.json({ msg: "Senha updated com sucesso!" });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao redefinir a senha." });
  }
});

module.exports = router;