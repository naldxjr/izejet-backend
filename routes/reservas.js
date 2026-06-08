const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva");
const Perfil = require("../models/Perfil");
const Usuario = require("../models/Usuario"); // 🔥 Importação adicionada para cruzamento seguro
const auth = require("../middleware/auth");

const criarDataSemFuso = (dataString) => {
  const partes = String(dataString).split("T")[0].split("-");
  if (partes.length !== 3) return new Date(dataString);
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]), 12, 0, 0, 0);
};

router.post("/", auth, async (req, res) => {
  try {
    const { cpf, produto, data } = req.body;

    if (!produto || !data) {
      return res.status(400).json({ msg: "Por favor, preencha todos os campos obrigatórios." });
    }

    let perfilEncontrado;

    // Busca o documento oficial do usuário autenticado pelo ID seguro do Token
    const usuarioLogado = await Usuario.findById(req.user.id);

    if (req.user.cargo === "admin") {
      if (!cpf) return res.status(400).json({ msg: "O CPF do cliente é obrigatório para o administrador." });
      
      // 🔥 GERADOR DE REGEX FLEXÍVEL: Ignora qualquer tipo de pontuação ou máscara no banco
      const cpfLimpo = String(cpf).replace(/\D/g, "");
      const cpfRegex = new RegExp(cpfLimpo.split("").join("\\D*"), "i");
      
      perfilEncontrado = await Perfil.findOne({ cpf: { $regex: cpfRegex } });
    } else {
      // 1ª Tentativa: Busca direta e veloz pelo ID do usuário vinculado
      perfilEncontrado = await Perfil.findOne({ usuario: req.user.id });

      // 2ª Tentativa (Auto-Cura): Se não achou pelo ID, busca usando o CPF do cadastro do Usuário
      if (!perfilEncontrado && usuarioLogado && usuarioLogado.cpf) {
        const cpfLimpo = String(usuarioLogado.cpf).replace(/\D/g, "");
        const cpfRegex = new RegExp(cpfLimpo.split("").join("\\D*"), "i");
        
        perfilEncontrado = await Perfil.findOne({ cpf: { $regex: cpfRegex } });
        
        // Se localizou por essa via, repara o banco colando o ID do usuário no Perfil
        if (perfilEncontrado) {
          perfilEncontrado.usuario = req.user.id;
          await perfilEncontrado.save();
        }
      }
      
      // 3ª Tentativa (Fallback): Busca usando o CPF enviado pelo navegador do cliente
      if (!perfilEncontrado && cpf) {
        const cpfLimpo = String(cpf).replace(/\D/g, "");
        const cpfRegex = new RegExp(cpfLimpo.split("").join("\\D*"), "i");
        perfilEncontrado = await Perfil.findOne({ cpf: { $regex: cpfRegex } });
        
        if (perfilEncontrado) {
          perfilEncontrado.usuario = req.user.id;
          await perfilEncontrado.save();
        }
      }
    }

    // Se após as 3 camadas de varredura profunda nada for localizado, o perfil realmente não existe
    if (!perfilEncontrado) {
      return res.status(404).json({ msg: "Perfil de cliente não encontrado. Complete seus dados no menu Perfil antes de agendar." });
    }

    const dataReserva = criarDataSemFuso(data);
    if (isNaN(dataReserva.getTime())) {
      return res.status(400).json({ msg: "Formato de data inválido." });
    }

    const inicioDia = new Date(dataReserva.getFullYear(), dataReserva.getMonth(), dataReserva.getDate(), 0, 0, 0, 0);
    const fimDoDia = new Date(dataReserva.getFullYear(), dataReserva.getMonth(), dataReserva.getDate(), 23, 59, 59, 999);

    const reservaExistente = await Reserva.findOne({
      produto,
      status: { $ne: "rejeitada" },
      data: {
        $gte: inicioDia,
        $lte: fimDoDia
      }
    });

    if (reservaExistente) {
      return res.status(409).json({ msg: "Este jet ski já está reservado para esta data. Escolha outra data." });
    }

    const reserva = new Reserva({
      perfil: perfilEncontrado._id,
      usuario: req.user.id,
      cpf: perfilEncontrado.cpf,
      produto,
      data: dataReserva,
      status: "pendente"
    });

    await reserva.save();

    const reservaPopulada = await Reserva.findById(reserva._id)
      .populate("perfil", "nome telefone endereco licencaMotonauta")
      .populate("usuario", "nome email cpf")
      .populate("produto");

    const io = req.app.get("io");
    if (io) io.emit("novaReserva", reservaPopulada);

    res.status(201).json(reservaPopulada);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao criar reserva." });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.cargo === "admin" ? {} : { usuario: req.user.id };
    
    const reservas = await Reserva.find(query)
      .populate("perfil", "nome telefone endereco licencaMotonauta")
      .populate("usuario", "nome email cpf")
      .populate("produto");

    res.json(reservas);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao buscar reservas." });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { produto, data } = req.body;
    
    const query = req.user.cargo === "admin" ? { _id: req.params.id } : { _id: req.params.id, usuario: req.user.id };
    const reserva = await Reserva.findOne(query);
    
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva não encontrada ou acesso negado." });
    }

    if (reserva.status === "aprovada" && req.user.cargo !== "admin") {
      return res.status(400).json({ msg: "Não é possível alterar uma reserva já confirmada." });
    }

    if (data) {
      const dataReserva = criarDataSemFuso(data);
      if (isNaN(dataReserva.getTime())) {
        return res.status(400).json({ msg: "Formato de data inválido." });
      }

      const inicioDia = new Date(dataReserva.getFullYear(), dataReserva.getMonth(), dataReserva.getDate(), 0, 0, 0, 0);
      const fimDoDia = new Date(dataReserva.getFullYear(), dataReserva.getMonth(), dataReserva.getDate(), 23, 59, 59, 999);

      const conflito = await Reserva.findOne({
        _id: { $ne: req.params.id },
        produto: produto || reserva.produto,
        status: { $ne: "rejeitada" },
        data: { $gte: inicioDia, $lte: fimDoDia }
      });

      if (conflito) {
        return res.status(409).json({ msg: "O ativo já possui um agendamento confirmado para esta data." });
      }
      reserva.data = dataReserva;
    }

    reserva.produto = produto || reserva.produto;
    await reserva.save();

    const reservaPopulada = await Reserva.findById(reserva._id)
      .populate("perfil", "nome telefone endereco licencaMotonauta")
      .populate("usuario", "nome email cpf")
      .populate("produto");

    const io = req.app.get("io");
    if (io) io.emit("reservaAtualizada", reservaPopulada);

    res.json(reservaPopulada);
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao atualizar reserva." });
  }
});

router.put("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.cargo !== "admin") {
      return res.status(403).json({ msg: "Acesso negado. Apenas administradores podem alterar o status." });
    }

    const { status } = req.body;
    if (!["pendente", "aprovada", "rejeitada"].includes(status)) {
      return res.status(400).json({ msg: "Status operacional inválido." });
    }

    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    )
      .populate("perfil", "nome telefone endereco licencaMotonauta")
      .populate("usuario", "nome email cpf")
      .populate("produto");
    
    if (!reserva) return res.status(404).json({ msg: "Reserva não encontrada." });

    const io = req.app.get("io");
    if (io) io.emit("reservaAtualizada", reserva);

    res.json(reserva);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao atualizar status da reserva." });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const query = req.user.cargo === "admin" ? { _id: req.params.id } : { _id: req.params.id, usuario: req.user.id };
    
    const reserva = await Reserva.findOne(query);
    if (!reserva) {
      return res.status(404).json({ msg: "Reserva não encontrada ou acesso negado." });
    }

    const idRemovido = reserva._id;
    await reserva.deleteOne();

    const io = req.app.get("io");
    if (io) io.emit("reservaRemovida", idRemovido);

    res.json({ msg: "Reserva cancelada com sucesso." });
  } catch (err) {
    res.status(500).json({ msg: "Erro no servidor ao cancelar reserva." });
  }
});

module.exports = router;