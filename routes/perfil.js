const express = require('express');
const router = express.Router();
const Perfil = require('../models/Perfil');
const Usuario = require('../models/Usuario');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

router.get('/todos', auth, async (req, res) => {
  try {
    // Agora ele busca TODOS os perfis do banco, com ou sem login
    const perfis = await Perfil.find().populate('usuario', 'email').sort({ createdAt: -1 });
    res.json(perfis);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor ao listar perfis.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { usuario, nome, cpf, email, senha, telefone, endereco, licencaMotonauta } = req.body;

    // Fluxo legado: perfil atrelado a um usuário da plataforma.
    if (usuario) {
      if (!telefone || !endereco || !licencaMotonauta) {
        return res.status(400).json({ msg: 'Por favor, preencha telefone, endereço e licença.' });
      }

      const usuarioEncontrado = await Usuario.findById(usuario).select('cpf');

      if (!usuarioEncontrado) {
        return res.status(404).json({ msg: 'Usuário não encontrado para vincular perfil.' });
      }

      const perfilExistente = await Perfil.findOne({ usuario });
      if (perfilExistente) {
        return res.status(400).json({
          msg: 'Este usuário já possui um perfil.'
        });
      }

      const novoPerfil = new Perfil({
        usuario,
        cpf: usuarioEncontrado.cpf,
        telefone,
        endereco,
        licencaMotonauta
      });

      const perfilSalvo = await novoPerfil.save();
      return res.status(201).json(perfilSalvo);
    }

    // Fluxo novo: perfil de cliente sem acesso de login na plataforma.
    if (!cpf || !nome || !email || !senha) {
      return res.status(400).json({ msg: 'Por favor, preencha nome, CPF, e-mail e senha.' });
    }

    const cpfNormalizado = String(cpf).replace(/\D/g, '');
    if (!cpfNormalizado) {
      return res.status(400).json({ msg: 'CPF inválido.' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const perfilPorCpf = await Perfil.findOne({ cpf: cpfNormalizado });
    if (perfilPorCpf) {
      return res.status(400).json({ msg: 'Já existe um perfil com este CPF.' });
    }

    const perfilPorEmail = await Perfil.findOne({ email: emailNormalizado });
    if (perfilPorEmail) {
      return res.status(400).json({ msg: 'Já existe um perfil com este e-mail.' });
    }

    const hashSenha = await bcrypt.hash(String(senha), 10);

    const novoPerfil = new Perfil({
      nome,
      email: emailNormalizado,
      senha: hashSenha,
      cpf: cpfNormalizado,
    });

    const perfilSalvo = await novoPerfil.save();
    return res.status(201).json(perfilSalvo);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Erro no servidor ao criar perfil." });
  }
});

router.get('/:usuarioId', auth, async (req, res) => {
  try {
    const perfil = await Perfil.findOne({ usuario: req.params.usuarioId }).populate('usuario', 'email');
    
    if (!perfil) {
      return res.status(404).json({ msg: "Perfil não encontrado." });
    }

    res.json(perfil);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Erro no servidor." });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'ID de perfil inválido.' });
    }

    const perfil = await Perfil.findById(id);

    if (!perfil) {
      return res.status(404).json({ msg: 'Perfil não encontrado.' });
    }

    if (perfil.usuario) {
      return res.status(400).json({ msg: 'Perfis vinculados a usuário não podem ser excluídos por esta tela.' });
    }

    await perfil.deleteOne();

    return res.json({ msg: 'Perfil excluído com sucesso.' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Erro no servidor ao excluir perfil.' });
  }
});

module.exports = router;