const express = require("express");
const router = express.Router();
const Perfil = require("../models/Perfil");
const Usuario = require("../models/Usuario");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");

router.get("/todos", auth, adminOnly, async (req, res) => {
  try {
    const perfis = await Perfil.find()
      .populate("usuario", "nome email cargo")
      .sort({ createdAt: -1 });
    res.json(perfis);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao listar perfis." });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { telefone, endereco, licencaMotonauta } = req.body;

    if (!telefone || !endereco || !licencaMotonauta) {
      return res.status(400).json({ msg: "Por favor, preencha todos os campos obrigatórios." });
    }

    const usuarioEncontrado = await Usuario.findById(req.user.id).select("cpf");
    if (!usuarioEncontrado) {
      return res.status(404).json({ msg: "Usuário não encontrado para vincular perfil." });
    }

    let perfilExistente = await Perfil.findOne({ usuario: req.user.id });
    
    if (perfilExistente) {
      perfilExistente.telefone = String(telefone).trim();
      perfilExistente.endereco = String(endereco).trim();
      perfilExistente.licencaMotonauta = String(licencaMotonauta).trim();
      
      await perfilExistente.save();
      return res.json(perfilExistente);
    }

    const novoPerfil = new Perfil({
      usuario: req.user.id,
      cpf: usuarioEncontrado.cpf,
      telefone: String(telefone).trim(),
      endereco: String(endereco).trim(),
      licencaMotonauta: String(licencaMotonauta).trim()
    });

    const perfilSalvo = await novoPerfil.save();
    res.status(201).json(perfilSalvo);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao processar perfil." });
  }
});

router.get("/:usuarioId", auth, async (req, res) => {
  try {
    const targetUserId = req.params.usuarioId;

    if (req.user.id !== targetUserId && req.user.cargo !== "admin") {
      return res.status(403).json({ msg: "Acesso negado. Você só pode consultar seu próprio perfil." });
    }

    const perfil = await Perfil.findOne({ usuario: targetUserId }).populate("usuario", "nome email");
    
    if (!perfil) {
      return res.status(404).json({ msg: "Perfil não encontrado." });
    }

    res.json(perfil);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao buscar perfil." });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de perfil inválido." });
    }

    const perfil = await Perfil.findById(id);
    if (!perfil) {
      return res.status(404).json({ msg: "Perfil não encontrado." });
    }

    await perfil.deleteOne();
    res.json({ msg: "Perfil removido com sucesso." });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao excluir perfil." });
  }
});

module.exports = router;