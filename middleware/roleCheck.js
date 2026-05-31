const adminOnly = (req, res, next) => {
  const usuario = req.user;

  if (!usuario) {
    return res.status(401).json({ msg: "Acesso negado. Usuário não autenticado." });
  }

  const cargoUser = usuario.cargo || usuario.role;

  if (cargoUser && String(cargoUser).trim().toLowerCase() === "admin") {
    return next();
  }

  res.status(403).json({ 
    msg: "Acesso proibido. Esta área requer privilégios de administração náutica." 
  });
};

module.exports = { adminOnly };