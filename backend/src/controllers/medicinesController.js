// backend/src/controllers/medicinesController.js
const supabase = require('../config/database');

const getStockStatus = (medicine) => {
  if (medicine.stock_actual === 0) return 'sin_stock';
  if (medicine.stock_actual < medicine.stock_minimo) return 'bajo_stock';
  return 'disponible';
};

const getAllMedicines = async (req, res) => {
  try {
    const { estado, buscar, page = 1, limit = 20 } = req.query;

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('medicamentos')
      .select('*', { count: 'exact' })
      .eq('activo', true)
      .order('nombre', { ascending: true })
      .range(from, to);

    if (buscar) {
      query = query.ilike('nombre', `%${buscar}%`);
    }

    if (estado === 'bajo_stock') {
      query = query.lt('stock_actual', 'stock_minimo');
    }

    if (estado === 'sin_stock') {
      query = query.eq('stock_actual', 0);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const medicines = (data || []).map((medicine) => ({
      ...medicine,
      estado_stock: getStockStatus(medicine)
    }));

    res.json({
      success: true,
      medicines,
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo medicamentos:', error);

    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamentos',
      error: error.message
    });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: medicine, error } = await supabase
      .from('medicamentos')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error || !medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado'
      });
    }

    res.json({
      success: true,
      medicine: {
        ...medicine,
        estado_stock: getStockStatus(medicine)
      }
    });
  } catch (error) {
    console.error('Error obteniendo medicamento:', error);

    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamento',
      error: error.message
    });
  }
};

const createMedicine = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      stock_actual = 0,
      stock_minimo = 0
    } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del medicamento es requerido'
      });
    }

    const { data: medicine, error } = await supabase
      .from('medicamentos')
      .insert([
        {
          nombre,
          descripcion: descripcion || null,
          stock_actual: Number(stock_actual),
          stock_minimo: Number(stock_minimo),
          activo: true
        }
      ])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Medicamento creado exitosamente',
      medicine,
      id: medicine.id
    });
  } catch (error) {
    console.error('Error creando medicamento:', error);

    res.status(500).json({
      success: false,
      message: 'Error al crear medicamento',
      error: error.message
    });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'nombre',
      'descripcion',
      'stock_minimo',
      'activo'
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
    }

    const { data: medicine, error } = await supabase
      .from('medicamentos')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Medicamento actualizado exitosamente',
      medicine
    });
  } catch (error) {
    console.error('Error actualizando medicamento:', error);

    res.status(500).json({
      success: false,
      message: 'Error al actualizar medicamento',
      error: error.message
    });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('medicamentos')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Medicamento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando medicamento:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar medicamento',
      error: error.message
    });
  }
};

const getLowStockMedicines = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medicamentos')
      .select('*')
      .eq('activo', true)
      .order('stock_actual', { ascending: true });

    if (error) throw error;

    const medicines = (data || [])
      .filter((medicine) => medicine.stock_actual < medicine.stock_minimo)
      .map((medicine) => ({
        ...medicine,
        deficit: medicine.stock_minimo - medicine.stock_actual,
        estado_stock: getStockStatus(medicine)
      }));

    res.json({
      success: true,
      medicines,
      count: medicines.length
    });
  } catch (error) {
    console.error('Error obteniendo medicamentos con bajo stock:', error);

    res.status(500).json({
      success: false,
      message: 'Error al obtener medicamentos',
      error: error.message
    });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines
};