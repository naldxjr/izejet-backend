const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");
const Perfil = require("../models/Perfil");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
    try {
        const { cpf, produto, data } = req.body;

        if (!cpf || !produto) {
            return res.status(400).json({ msg: "Por favor, preencha todos os campos obrigatórios." });
        }

        const cpfNormalizado = String(cpf).replace(/\D/g, "");

        if (!cpfNormalizado) {
            return res.status(400).json({ msg: "Por favor, informe um CPF válido." });
        }

        const perfis = await Perfil.find().select("_id cpf");
        const perfilEncontrado = perfis.find((perfil) => String(perfil.cpf).replace(/\D/g, "") === cpfNormalizado);

        if (!perfilEncontrado) {
            return res.status(404).json({ msg: "Nenhum perfil de cliente encontrado com esse CPF." });
        }

        if (data) {
            const dataReserva = new Date(data);
            const inicioDodia = new Date(dataReserva.getFullYear(), dataReserva.getMonth(), dataReserva.getDate(), 0, 0, 0);
            const fimDoDia = new Date(dataReserva.getFullYear(), dataReserva.getMonth(), dataReserva.getDate(), 23, 59, 59);

            const reservaExistente = await Reserva.findOne({
                produto,
                data: {
                    $gte: inicioDodia,
                    $lte: fimDoDia
                }
            });

            if (reservaExistente) {
                return res.status(409).json({ msg: "Este jet ski já está reservado para esta data. Escolha outra data." });
            }
        }

        const reserva = new Reserva({
            perfil: perfilEncontrado._id,
            cpf: perfilEncontrado.cpf,
            produto,
            data 
        });

        await reserva.save();
        res.status(201).json(reserva);
    } catch (err) {
        res.status(500).json({ msg: "Erro no servidor ao criar reserva." });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const reservas = await Reserva.find()
            .populate("perfil")
            .populate("usuario", "-senha")
            .populate("produto");

        res.json(reservas);
    } catch (err) {
        res.status(500).json({ msg: "Erro no servidor ao buscar reservas." });
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { cpf, produto } = req.body;
        let reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({ msg: "Reserva não encontrada." });
        }

        reserva.cpf = cpf || reserva.cpf;
        reserva.produto = produto || reserva.produto;

        await reserva.save();
        res.json(reserva);
    } catch (err) {
        res.status(500).json({ msg: "Erro no servidor ao atualizar reserva." });
    }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!reserva) return res.status(404).json({ msg: 'Reserva não encontrada' });
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao atualizar status da reserva' });
  }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({ msg: "Reserva não encontrada." });
        }

        await reserva.deleteOne();
        res.json({ msg: "Reserva cancelada com sucesso." });
    } catch (err) {
        res.status(500).json({ msg: "Erro no servidor ao cancelar reserva." });
    }
});

module.exports = router;