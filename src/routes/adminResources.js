const express = require('express');
const router = express.Router();
const { query } = require('../services/database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin resource routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/resources
 * List all resource submissions with search, filter, pagination
 * Query params: ?search=&status=&showDeleted=true&page=1&limit=25
 */
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      status = '',
      showDeleted = 'false',
      page = '1',
      limit = '25',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Allowed sort columns to prevent SQL injection
    const allowedSorts = ['created_at', 'name', 'email', 'status', 'id'];
    const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Filter deleted items unless showDeleted is true
    if (showDeleted !== 'true') {
      conditions.push(`deleted_at IS NULL`);
    }

    // Status filter
    if (status && status !== 'all') {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Search filter (name, email, phone, location, description)
    if (search) {
      conditions.push(`(
        LOWER(name) LIKE LOWER($${paramIndex}) OR 
        LOWER(email) LIKE LOWER($${paramIndex}) OR 
        LOWER(phone) LIKE LOWER($${paramIndex}) OR 
        LOWER(location) LIKE LOWER($${paramIndex}) OR 
        LOWER(description) LIKE LOWER($${paramIndex})
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM resource_requests ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const dataResult = await query(
      `SELECT * FROM resource_requests ${whereClause} 
       ORDER BY ${safeSortBy} ${safeSortOrder} 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limitNum, offset]
    );

    // Get status counts for filter badges
    const statusCounts = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count
      FROM resource_requests 
      GROUP BY status
    `);

    res.json({
      ok: true,
      submissions: dataResult.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      statusCounts: statusCounts.rows
    });
  } catch (error) {
    console.error('[ADMIN RESOURCES] Error listing submissions:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch submissions' });
  }
});

/**
 * GET /api/admin/resources/:id
 * Get full submission detail
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM resource_requests WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Submission not found' });
    }

    res.json({ ok: true, submission: result.rows[0] });
  } catch (error) {
    console.error('[ADMIN RESOURCES] Error fetching submission:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch submission' });
  }
});

/**
 * PATCH /api/admin/resources/:id/status
 * Update submission status (new, reviewed, matched, closed, deleted)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'reviewed', 'matched', 'closed', 'spam'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await query(
      'UPDATE resource_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Submission not found' });
    }

    console.log(`[ADMIN RESOURCES] Status updated: #${id} → ${status} by admin ${req.user.email}`);
    res.json({ ok: true, submission: result.rows[0] });
  } catch (error) {
    console.error('[ADMIN RESOURCES] Error updating status:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to update status' });
  }
});

/**
 * DELETE /api/admin/resources/:id
 * Soft delete a submission (sets deleted_at, deleted_by, delete_reason)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'No reason provided' } = req.body;
    const deletedBy = req.user.email || req.user.name || `admin_${req.user.id}`;

    const result = await query(
      `UPDATE resource_requests 
       SET deleted_at = NOW(), 
           deleted_by = $1, 
           delete_reason = $2,
           status = 'deleted'
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [deletedBy, reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Submission not found or already deleted'
      });
    }

    console.log(`[ADMIN RESOURCES] Soft deleted: #${id} by ${deletedBy} — reason: ${reason}`);
    res.json({ ok: true, submission: result.rows[0] });
  } catch (error) {
    console.error('[ADMIN RESOURCES] Error deleting submission:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to delete submission' });
  }
});

/**
 * POST /api/admin/resources/:id/restore
 * Restore a soft-deleted submission
 */
router.post('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE resource_requests 
       SET deleted_at = NULL, 
           status = 'reviewed'
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Submission not found or not deleted'
      });
    }

    console.log(`[ADMIN RESOURCES] Restored: #${id} by admin ${req.user.email}`);
    res.json({ ok: true, submission: result.rows[0] });
  } catch (error) {
    console.error('[ADMIN RESOURCES] Error restoring submission:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to restore submission' });
  }
});

/**
 * GET /api/admin/resources/stats/summary
 * Get summary statistics for the dashboard
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_active,
        COUNT(*) FILTER (WHERE status = 'new' AND deleted_at IS NULL) as new_count,
        COUNT(*) FILTER (WHERE status = 'reviewed' AND deleted_at IS NULL) as reviewed_count,
        COUNT(*) FILTER (WHERE status = 'matched' AND deleted_at IS NULL) as matched_count,
        COUNT(*) FILTER (WHERE status = 'closed' AND deleted_at IS NULL) as closed_count,
        COUNT(*) FILTER (WHERE status = 'spam' AND deleted_at IS NULL) as spam_count,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count,
        COUNT(*) as total_all
      FROM resource_requests
    `);

    res.json({ ok: true, stats: result.rows[0] });
  } catch (error) {
    console.error('[ADMIN RESOURCES] Error fetching stats:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
});

module.exports = router;
