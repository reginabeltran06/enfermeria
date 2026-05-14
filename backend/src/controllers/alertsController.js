  // backend/src/controllers/alertsController.js
  const supabase = require('../config/database');

  const getActiveAlerts = async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          medicamentos (
            id,
            nombre,
            stock_actual,
            stock_minimo
          )
        `)
        .eq('leida', false)
        .order('creado_en', { ascending: false });

      if (error) throw error;

      const alerts = (data || []).map((alert) => ({
        ...alert,
        medicamento: alert.medicamentos?.nombre || null,
        stock_actual: alert.medicamentos?.stock_actual || null,
        stock_minimo: alert.medicamentos?.stock_minimo || null
      }));

      res.json({
        success: true,
        alerts,
        count: alerts.length
      });
    } catch (error) {
      console.error('Error obteniendo alertas:', error);

      res.status(500).json({
        success: false,
        message: 'Error al obtener alertas',
        error: error.message
      });
    }
  };

  const getLowStockAlerts = async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          medicamentos (
            id,
            nombre,
            stock_actual,
            stock_minimo
          )
        `)
        .eq('tipo', 'bajo_stock')
        .eq('leida', false)
        .order('creado_en', { ascending: false });

      if (error) throw error;
const alerts = (data || []).map((alert) => ({
  ...alert,
  medicamento: alert.medicamentos?.nombre ?? null,
  stock_actual: alert.medicamentos?.stock_actual ?? null,
  stock_minimo: alert.medicamentos?.stock_minimo ?? null
}));

      res.json({
        success: true,
        alerts,
        count: alerts.length
      });
    } catch (error) {
      console.error('Error obteniendo alertas de bajo stock:', error);

      res.status(500).json({
        success: false,
        message: 'Error al obtener alertas',
        error: error.message
      });
    }
  };

  const acknowledgeAlert = async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Alerta marcada como leída'
      });
    } catch (error) {
      console.error('Error marcando alerta:', error);

      res.status(500).json({
        success: false,
        message: 'Error al marcar alerta',
        error: error.message
      });
    }
  };
const generateAlerts = async (req, res) => {
  try {
    const { data: medicines, error: medicinesError } = await supabase
      .from('medicamentos')
      .select('id, nombre, stock_actual, stock_minimo')
      .eq('activo', true);

    if (medicinesError) throw medicinesError;

    let alertasCreadas = 0;
    let alertasCerradas = 0;

    for (const medicine of medicines || []) {
      const stockActual = Number(medicine.stock_actual);
      const stockMinimo = Number(medicine.stock_minimo);

      let tipoAlerta = null;

      if (stockActual === 0) {
        tipoAlerta = 'sin_stock';
      } else if (stockActual > 0 && stockActual < stockMinimo) {
        tipoAlerta = 'bajo_stock';
      }

      // Si el medicamento ya está bien de stock, cerrar alertas activas previas
      if (!tipoAlerta) {
        const { error: closeError } = await supabase
          .from('alertas')
          .update({ leida: true })
          .eq('medicamento_id', medicine.id)
          .eq('leida', false);

        if (closeError) throw closeError;

        continue;
      }

      // Cerrar alertas activas del mismo medicamento pero de otro tipo
      const { error: closeOldTypeError } = await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('medicamento_id', medicine.id)
        .eq('leida', false)
        .neq('tipo', tipoAlerta);

      if (closeOldTypeError) throw closeOldTypeError;

      // Revisar si ya existe una alerta activa correcta
      const { data: existingAlert, error: existingError } = await supabase
        .from('alertas')
        .select('id')
        .eq('medicamento_id', medicine.id)
        .eq('tipo', tipoAlerta)
        .eq('leida', false)
        .limit(1);

      if (existingError) throw existingError;

      if (!existingAlert || existingAlert.length === 0) {
        const { error: insertError } = await supabase
          .from('alertas')
          .insert([
            {
              medicamento_id: medicine.id,
              tipo: tipoAlerta,
              mensaje:
                tipoAlerta === 'sin_stock'
                  ? `${medicine.nombre} está sin stock`
                  : `${medicine.nombre} tiene stock bajo (${medicine.stock_actual} unidades, mínimo: ${medicine.stock_minimo})`,
              leida: false
            }
          ]);

        if (insertError) throw insertError;

        alertasCreadas++;
      }
    }

    res.json({
      success: true,
      message: `${alertasCreadas} alertas generadas`,
      alertasCreadas,
      alertasCerradas
    });
  } catch (error) {
    console.error('Error generando alertas:', error);

    res.status(500).json({
      success: false,
      message: 'Error al generar alertas',
      error: error.message
    });
  }
};
  const getAlertsSummary = async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select('*');

      if (error) throw error;

      const alerts = data || [];

      const summary = {
        total_alertas: alerts.length,
        alertas_activas: alerts.filter((alert) => !alert.leida).length,
        bajo_stock: alerts.filter((alert) => alert.tipo === 'bajo_stock' && !alert.leida).length,
          sin_stock: alerts.filter((alert) => alert.tipo === 'sin_stock' && !alert.leida).length

      };

      res.json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Error obteniendo resumen de alertas:', error);

      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen',
        error: error.message
      });
    }
  };

  module.exports = {
    getActiveAlerts,
    getLowStockAlerts,
    acknowledgeAlert,
    generateAlerts,
    getAlertsSummary
  };