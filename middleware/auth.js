const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  process.exit(1);
}

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "Acesso negado. Token não fornecido." });
  }

  const partes = authHeader.split(" ");
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({ msg: "Token mal formatado. Utilize o padrão Bearer." });
  }

  const token = partes[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({ msg: "Token inválido. Payload corrompido." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Sessão expirada. Por favor, refaça o login." });
    }
    res.status(401).json({ msg: "Token inválido ou assinatura violada." });
  }
};