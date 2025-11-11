const { query } = require('../services/database/db');
const { generateBlueprint } = require('../services/ai/openai');
const logger = require('../utils/logger');

// Generate AI blueprint for a case
const generate = async (req, res, next) => {
  try {
    const { case_id } = req.body;

    if (!case_id) {
      return res.status(400).json({ error: 'case_id is required' });
    }

    // Get case details
    const caseResult = await query(
      'SELECT * FROM cases WHERE id = $1 AND user_id = $2',
      [case_id, req.user.id]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseData = caseResult.rows[0];

    // Check if blueprint already generated
    if (caseData.blueprint_generated) {
      return res.json({
        message: 'Blueprint already exists for this case',
        blueprint: caseData.blueprint_content,
        generated_at: caseData.blueprint_generated_at
      });
    }

    // Generate blueprint using AI
    const { blueprint, tokens_used } = await generateBlueprint(caseData);

    // Update case with generated blueprint
    await query(
      `UPDATE cases 
       SET blueprint_generated = TRUE, 
           blueprint_content = $1, 
           blueprint_generated_at = CURRENT_TIMESTAMP,
           status = 'processing'
       WHERE id = $2`,
      [blueprint, case_id]
    );

    logger.info('Blueprint saved to database', { caseId: case_id, tokens: tokens_used });

    res.json({
      message: 'Blueprint generated successfully',
      blueprint,
      case_id,
      tokens_used
    });
  } catch (error) {
    next(error);
  }
};

// Get existing blueprint
const getBlueprint = async (req, res, next) => {
  try {
    const { case_id } = req.params;

    const result = await query(
      `SELECT blueprint_content, blueprint_generated_at, status 
       FROM cases 
       WHERE id = $1 AND user_id = $2 AND blueprint_generated = TRUE`,
      [case_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blueprint not found for this case' });
    }

    res.json({
      blueprint: result.rows[0].blueprint_content,
      generated_at: result.rows[0].blueprint_generated_at,
      status: result.rows[0].status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generate,
  getBlueprint
};
