import { Router } from 'express';
import {
	getPermissions,
	getPermissionById,
	createPermission,
	updatePermission,
	deletePermission,
} from '../controllers/permission.controller';
import { verifyAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Lấy danh sách permissions (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Lọc theo module (USER, AUTH, ACCESS-CONTROLLER)
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái active
 *     responses:
 *       200:
 *         description: Danh sách permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 *                 traceId:
 *                   type: string
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyAuth, requireAdmin, getPermissions);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Lấy thông tin permission theo ID (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Thông tin permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 traceId:
 *                   type: string
 *       404:
 *         description: Permission không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', verifyAuth, requireAdmin, getPermissionById);

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Tạo permission mới (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionCreateRequest'
 *     responses:
 *       201:
 *         description: Tạo permission thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 traceId:
 *                   type: string
 *       409:
 *         description: Permission đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', verifyAuth, requireAdmin, createPermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Cập nhật permission (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionUpdateRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 traceId:
 *                   type: string
 *       404:
 *         description: Permission không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', verifyAuth, requireAdmin, updatePermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Xóa permission (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       204:
 *         description: Xóa thành công
 *       403:
 *         description: Permission đang được sử dụng bởi role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Permission không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', verifyAuth, requireAdmin, deletePermission);

export default router;
