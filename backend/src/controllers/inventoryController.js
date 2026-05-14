// backend/src/controllers/inventoryController.js
const supabase = require('../config/database');

const getMedicine = async (medicamento_id) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .eq('id', medicamento_id)
    .eq('activo', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};

const updateMedicineStock = async (medicamento_id, stock_nuevo) => {
  const { error } = await supabase
    .from('medicamentos')
    .update({ stock_actual: stock_nuevo })
    .eq('id', medicamento_id);

  if (error) throw error;
};

const createMovement = async ({
  medicamento_id,
  usuario_id,
  tipo,
  cantidad,
  motivo
}) => {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert([
      {
        medicamento_id,
        usuario_id,
        tipo,
        cantidad: Number(cantidad),
        motivo: motivo || null
      }
    ])
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

const recordEntry = async (req, res) => {
  try {
    const { medicamento_id, cantidad, motivo } = req.body;
    const usuario_id = req.user.id;

    if (!medicamento_id || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Medicamento y cantidad válida son requeridos'
      });
    }

    const medicine = await getMedicine(medicamento_id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    const stock_nuevo = Number(medicine.stock_actual) + Number(cantidad);

    const movement = await createMovement({
      medicamento_id,
      usuario_id,
      tipo: 'entrada',
      cantidad,
      motivo: motivo || 'entrada'
    });

    await updateMedicineStock(medicamento_id, stock_nuevo);

    res.json({
      success: true,
      message: 'Entrada registrada exitosamente',
      movimiento_id: movement.id,
      stock_actual: stock_nuevo
    });
  } catch (error) {
    console.error('Error registrando entrada:', error);

    res.status(500).json({
      success: false,
      message: 'Error al registrar entrada',
      error: error.message
    });
  }
};

const recordExit = async (req, res) => {
  try {
    const { medicamento_id, cantidad, motivo } = req.body;
    const usuario_id = req.user.id;

    if (!medicamento_id || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Medicamento y cantidad válida son requeridos'
      });
    }

    const medicine = await getMedicine(medicamento_id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    if (Number(medicine.stock_actual) < Number(cantidad)) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente',
        stock_disponible: medicine.stock_actual
      });
    }

    const stock_nuevo = Number(medicine.stock_actual) - Number(cantidad);

    const movement = await createMovement({
      medicamento_id,
      usuario_id,
      tipo: 'salida',
      cantidad,
      motivo: motivo || 'salida'
    });

    await updateMedicineStock(medicamento_id, stock_nuevo);

    res.json({
      success: true,
      message: 'Salida registrada exitosamente',
      movimiento_id: movement.id,
      stock_actual: stock_nuevo
    });
  } catch (error) {
    console.error('Error registrando salida:', error);

    res.status(500).json({
      success: false,
      message: 'Error al registrar salida',
      error: error.message
    });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { medicamento_id, nueva_cantidad, motivo } = req.body;
    const usuario_id = req.user.id;

    if (!medicamento_id || nueva_cantidad === undefined || Number(nueva_cantidad) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Medicamento y nueva cantidad válida son requeridos'
      });
    }

    const medicine = await getMedicine(medicamento_id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    const diferencia = Number(nueva_cantidad) - Number(medicine.stock_actual);

    const movement = await createMovement({
      medicamento_id,
      usuario_id,
      tipo: 'ajuste',
      cantidad: Math.abs(diferencia),
      motivo: motivo || 'ajuste'
    });

    await updateMedicineStock(medicamento_id, Number(nueva_cantidad));

    res.json({
      success: true,
      message: 'Stock ajustado exitosamente',
      movimiento_id: movement.id,
      stock_actual: Number(nueva_cantidad)
    });
  } catch (error) {
    console.error('Error ajustando stock:', error);

    res.status(500).json({
      success: false,
      message: 'Error al ajustar stock',
      error: error.message
    });
  }
};

const getMovementHistory = async (req, res) => {
  try {
    const { medicamento_id, tipo, page = 1, limit = 50 } = req.query;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('movimientos_inventario')
      .select(`
        *,
        medicamentos (
          id,
          nombre
        ),
        usuarios (
          id,
          nombre
        )
      `, { count: 'exact' })
      .order('creado_en', { ascending: false })
      .range(from, to);

    if (medicamento_id) {
      query = query.eq('medicamento_id', medicamento_id);
    }

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const movements = (data || []).map((movement) => ({
      ...movement,
      medicamento: movement.medicamentos?.nombre || null,
      usuario: movement.usuarios?.nombre || null
    }));

    res.json({
      success: true,
      movements,
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);

    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movimientos_inventario')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) throw error;

    const reportMap = {};

    for (const movement of data || []) {
      const fecha = movement.creado_en?.slice(0, 10);
      const key = `${fecha}-${movement.tipo}`;

      if (!reportMap[key]) {
        reportMap[key] = {
          fecha,
          tipo: movement.tipo,
          cantidad_movimientos: 0,
          total_cantidad: 0
        };
      }

      reportMap[key].cantidad_movimientos += 1;
      reportMap[key].total_cantidad += Number(movement.cantidad || 0);
    }

    res.json({
      success: true,
      report: Object.values(reportMap)
    });
  } catch (error) {
    console.error('Error generando reporte:', error);

    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: error.message
    });
  }
};

const getStockSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medicamentos')
      .select('*')
      .eq('activo', true);

    if (error) throw error;

    const medicines = data || [];
const summary = {
  total_medicamentos: medicines.length,
  total_stock: medicines.reduce((sum, medicine) => sum + Number(medicine.stock_actual || 0), 0),
  total_stock_minimo: medicines.reduce((sum, medicine) => sum + Number(medicine.stock_minimo || 0), 0),


bajo_stock: medicines.filter(
  (medicine) =>
    Number(medicine.stock_actual) > 0 &&
    Number(medicine.stock_actual) < Number(medicine.stock_minimo)
).length,

  sin_stock: medicines.filter(
    (medicine) => Number(medicine.stock_actual) === 0
  ).length
  
};

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);

    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message
    });
  }
};

module.exports = {
  recordEntry,
  recordExit,
  adjustStock,
  getMovementHistory,
  getInventoryReport,
  getStockSummary
};