const adminOnly = (req, res, next) => {
  // O middleware 'auth' já deve ter colocado o usuário em req.user
  if (req.user && req.user.cargo === 'admin') {
    next(); // É admin, pode passar!
  } else {
    res.status(403).json({ msg: "Acesso negado. Apenas administradores podem realizar esta ação." });
  }
};

module.exports = { adminOnly };