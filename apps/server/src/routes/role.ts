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
 *     summary: Lấy danh sách roles (Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái active
 *     responses:
 *       200:
 *         description: Danh sách roles
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
 *         description: Không có quyền truy cập
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
 *     summary: Lấy thông tin role theo ID (Admin only)
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
 *         description: Thông tin role
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
 *         description: Role không tồn tại
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
 *     summary: Tạo role mới (Admin only)
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
 *         description: Tạo role thành công
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
 *         description: Role đã tồn tại
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
 *     summary: Cập nhật role (Admin only)
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
 *         description: Cập nhật thành công
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
 *         description: Role không tồn tại
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
 *     summary: Xóa role (Admin only)
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
 *         description: Xóa thành công
 *       403:
 *         description: Role đang được sử dụng bởi user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role không tồn tại
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
 *     summary: Cập nhật permissions cho role (Admin only)
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
 *         description: Cập nhật permissions thành công
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
 *         description: Role hoặc Permission không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/permissions', verifyAuth, requireAdmin, updateRolePermissions);

export default router;
