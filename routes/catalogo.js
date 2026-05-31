const express = require("express");
const router = express.Router();
const Catalogo = require("../models/Catalogo");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");
const upload = require("../config/cloudinary");

router.post("/", auth, adminOnly, upload.single("imagem"), async (req, res) => {
  try {
    const { produto, descricao, preco, local, tag } = req.body;

    if (!produto || !descricao || preco == null) {
      return res.status(400).json({ msg: "Por favor, preencha todos os campos obrigatórios." });
    }

    const imagemUrl = req.file ? req.file.path : req.body.imagem;
    if (!imagemUrl) {
      return res.status(400).json({ msg: "A imagem do ativo náutico é obrigatória." });
    }

    const item = new Catalogo({
      produto: String(produto).trim(),
      descricao: String(descricao).trim(),
      preco: Number(preco),
      imagem: imagemUrl, 
      local: local ? String(local).trim() : undefined,
      tag: tag ? String(tag).trim() : undefined
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao criar item no catálogo." });
  }
});

router.get("/", async (req, res) => {
  try {
    const itens = await Catalogo.find().sort({ produto: 1 });
    res.json(itens);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao buscar catálogo." });
  }
});

router.put("/:id", auth, adminOnly, upload.single("imagem"), async (req, res) => {
  try {
    const { id } = req.params;
    const { produto, descricao, preco, local, tag } = req.body;

    let jetSkiAtualizado = await Catalogo.findById(id);
    if (!jetSkiAtualizado) {
      return res.status(404).json({ msg: "Jet Ski não encontrado." });
    }

    if (produto !== undefined) jetSkiAtualizado.produto = String(produto).trim();
    if (descricao !== undefined) jetSkiAtualizado.descricao = String(descricao).trim();
    if (preco !== undefined && preco !== null) jetSkiAtualizado.preco = Number(preco);
    if (local !== undefined) jetSkiAtualizado.local = String(local).trim();
    if (tag !== undefined) jetSkiAtualizado.tag = String(tag).trim();

    if (req.file) {
      jetSkiAtualizado.imagem = req.file.path; 
    }

    await jetSkiAtualizado.save();
    res.json({ msg: "Jet Ski updated com sucesso!", jetSki: jetSkiAtualizado });
  } catch (error) {
    res.status(500).json({ msg: "Erro no servidor ao tentar editar item." });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const item = await Catalogo.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: "Item não encontrado." });
    }

    await item.deleteOne();
    res.json({ msg: "Item removido do catálogo com sucesso." });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao remover item." });
  }
});

module.exports = router;