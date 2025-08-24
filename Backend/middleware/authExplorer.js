export const authExplorer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role !== "explorer") {
    return res.status(403).json({ message: "Solo los visitantes pueden comentar" });
  }

  next();
};
