const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "Token não fornecido" });
  }

  const token = authHeader.includes(" ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) {
    return res.status(401).json({ msg: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token inválido" });
  }
};