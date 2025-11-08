import { Router } from 'express';
import {
	getRoles,
	getRoleById,
	createRole,
	updateRole,
	deleteRole,
	updateRolePermissions,
} from '../controllers/role.controller';
import { verifyAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get list of roles (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *                 traceId:
 *                   type: string
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyAuth, requireAdmin, getRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role information by ID (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *                 traceId:
 *                   type: string
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', verifyAuth, requireAdmin, getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create new role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCreateRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *                 traceId:
 *                   type: string
 *       409:
 *         description: Role already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', verifyAuth, requireAdmin, createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUpdateRequest'
 *     responses:
 *       200:
 *         description: Update successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *                 traceId:
 *                   type: string
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', verifyAuth, requireAdmin, updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       204:
 *         description: Delete successful
 *       403:
 *         description: Role is in use by users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', verifyAuth, requireAdmin, deleteRole);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   patch:
 *     summary: Update role permissions (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRolePermissionsRequest'
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *                 traceId:
 *                   type: string
 *       404:
 *         description: Role or Permission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/permissions', verifyAuth, requireAdmin, updateRolePermissions);

export default router;
