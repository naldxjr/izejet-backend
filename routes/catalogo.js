const express = require("express");
const router = express.Router();
const Catalogo = require("../models/Catalogo");
const auth = require("../middleware/auth");
const upload = require('../config/cloudinary');

router.post('/', auth, upload.single('imagem'), async (req, res) => {
    try {
        const { produto, descricao, preco, local, tag } = req.body;

        if (!produto || !descricao || preco == null) {
            return res.status(400).json({ msg: "Por favor, preencha todos os campos obrigatórios." });
        }

        const imagemUrl = req.file ? req.file.path : req.body.imagem;

        if (!imagemUrl) {
            return res.status(400).json({ msg: "A imagem é obrigatória." });
        }

        const item = new Catalogo({
            produto,
            descricao,
            preco,
            imagem: imagemUrl, 
            local,
            tag
        });

        await item.save();
        res.status(201).json(item);
    } catch (err) {
        console.error("Erro ao criar item no catálogo:", err);
        res.status(500).json({
            msg: "Erro no servidor ao fazer upload.",
            erro: err.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const itens = await Catalogo.find();
        res.json(itens);
    } catch (err) {
        console.error("Erro ao buscar catálogo:", err);
        res.status(500).json({ msg: "Erro no servidor." });
    }
});

router.put("/:id", auth, upload.single('imagem'), async (req, res) => {
    try {
        const { produto, descricao, preco, local, tag } = req.body;
        let item = await Catalogo.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ msg: "Item não encontrado." });
        }

        const imagemUrl = req.file ? req.file.path : item.imagem;

        item.produto = produto || item.produto;
        item.descricao = descricao || item.descricao;
        item.preco = preco != null ? preco : item.preco;
        item.local = local || item.local;
        item.tag = tag || item.tag;
        item.imagem = imagemUrl;

        await item.save();
        res.json(item);
    } catch (err) {
        console.error("Erro ao atualizar item:", err);
        res.status(500).json({ msg: "Erro no servidor." });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const item = await Catalogo.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: "Item não encontrado." });

        await item.deleteOne();
        res.json({ msg: "Item removido do catálogo." });
    } catch (err) {
        res.status(500).json({ msg: "Erro no servidor." });
    }
});

module.exports = router;