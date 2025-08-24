const Investigacion = require('../models/Investigacion');

// Escapa caracteres especiales para usar en RegExp
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function obtenerInvestigaciones(req, res) {
  try {
    // SIEMPRE tomar los query params de req.query (dentro del handler)
    const { area, materia: materiaQP, grado, exact } = req.query;

    // Acepta ?materia=... o ?area=...
    const materiasParam = (typeof materiaQP === 'string' && materiaQP.length > 0)
      ? materiaQP
      : area;

    const filtro = {};

    // ---- FILTRO POR MATERIA ----
    if (materiasParam) {
      const materias = materiasParam
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const exactMatch = String(exact ?? 'true').toLowerCase() !== 'false'; 
      if (materias.length === 1) {
        const m = materias[0];
        const pattern = exactMatch ? `^${escapeRegex(m)}$` : escapeRegex(m);
        filtro.materia = new RegExp(pattern, 'i'); // insensible a mayúsculas
      } else {
        filtro.materia = {
          $in: materias.map(m => {
            const pattern = exactMatch ? `^${escapeRegex(m)}$` : escapeRegex(m);
            return new RegExp(pattern, 'i');
          })
        };
      }
    }

    // ---- FILTRO POR GRADO (en tu esquema es String) ----
    if (grado) {
      filtro['autor.grado'] = new RegExp(`^${escapeRegex(grado)}$`, 'i');
      // si lo quieres exacto: filtro['autor.grado'] = grado;
    }

    // Ejecuta la consulta
    const investigaciones = await Investigacion.find(filtro).lean();
    return res.status(200).json(investigaciones);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Error al obtener las investigaciones', details: error.message });
  }
}

module.exports = { obtenerInvestigaciones };
