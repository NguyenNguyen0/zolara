import {
	describe,
	beforeAll,
	afterAll,
	it,
	expect,
	jest,
} from '@jest/globals';
import { Server } from 'http';
import {
	createTestServer,
	createTestUser,
	cleanupTestUser,
	cleanupAllTestData,
	TestUser,
} from './utils/test-setup';

// Increase timeout for the entire test suite
jest.setTimeout(30000);

describe('User API Routes', () => {
	let server: Server;
	let agent: any; // supertest agent
	let testUser1: TestUser;
	let testUser2: TestUser;

	beforeAll(async () => {
		try {
			// Set up test server
			const testServer = createTestServer();
			server = testServer.server;
			agent = testServer.agent;

			// Clean up any leftover test data
			await cleanupAllTestData();

			console.log('Creating test user 1...');
			// Create test users
			testUser1 = await createTestUser({
				email: 'test.user1@example.com',
				password: 'Test123!',
				firstName: 'Test',
				lastName: 'User1',
			});
			console.log('Test user 1 created with ID:', testUser1.uid);

			console.log('Creating test user 2...');
			testUser2 = await createTestUser({
				email: 'test.user2@example.com',
				password: 'Test123!',
				firstName: 'Test',
				lastName: 'User2',
			});
			console.log('Test user 2 created with ID:', testUser2.uid);
		} catch (error) {
			console.error('Error in beforeAll:', error);
			throw error;
		}
	});

	afterAll(async () => {
		try {
			// Clean up all test data and users
			if (testUser1?.uid) {
				await cleanupTestUser(testUser1.uid);
			}
			if (testUser2?.uid) {
				await cleanupTestUser(testUser2.uid);
			}
			await cleanupAllTestData();

			// Close the server
			if (server) {
				await new Promise<void>((resolve) => {
					server.close(() => resolve());
				});
			}
		} catch (error) {
			console.error('Error in afterAll:', error);
		}
	});

	// User Profile Tests
	describe('User Profile Endpoints', () => {
		it('should get a user profile by ID', async () => {
			const response = await agent
				.get(`/api/users/${testUser1.uid}`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id', testUser1.uid);
			expect(response.body.data).toHaveProperty('email', testUser1.email);
			expect(response.body.data).toHaveProperty(
				'firstName',
				testUser1.firstName,
			);
			expect(response.body.data).toHaveProperty(
				'lastName',
				testUser1.lastName,
			);
		});

		it('should get the authenticated user profile using "me"', async () => {
			const response = await agent
				.get(`/api/users/me`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id', testUser1.uid);
		});

		it('should return 401 when accessing "me" without auth token', async () => {
			const response = await agent.get(`/api/users/me`);

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});

		it('should return 404 when user profile not found', async () => {
			const nonExistentId = 'non-existent-user-id';
			const response = await agent
				.get(`/api/users/${nonExistentId}`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});

		it('should update user profile successfully', async () => {
			const updateData = {
				firstName: 'Updated',
				lastName: 'Name',
				bio: 'This is a test bio',
				gender: 'other',
			};

			const response = await agent
				.put(`/api/users/`)
				.set('Authorization', `Bearer ${testUser1.token}`)
				.send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty(
				'firstName',
				updateData.firstName,
			);
			expect(response.body.data).toHaveProperty(
				'lastName',
				updateData.lastName,
			);
			expect(response.body.data).toHaveProperty('bio', updateData.bio);
			expect(response.body.data).toHaveProperty(
				'gender',
				updateData.gender,
			);
		});

		it('should return 400 when updating with invalid data', async () => {
			const invalidData = {
				firstName: 'A'.repeat(30), // Too long (max 20 chars)
			};

			const response = await agent
				.put(`/api/users/`)
				.set('Authorization', `Bearer ${testUser1.token}`)
				.send(invalidData);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});



	// Block User Tests
	describe('Block User Endpoints', () => {
		it('should block a user successfully', async () => {
			const response = await agent
				.post(`/api/users/blocks/${testUser2.uid}`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should get block list for the authenticated user', async () => {
			const response = await agent
				.get(`/api/users/me/blocks`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('ownerId', testUser1.uid);
			expect(Array.isArray(response.body.data.blockedUsers)).toBe(true);
			expect(response.body.data.blockedUsers.length).toBe(1);
			expect(response.body.data.blockedUsers[0]).toHaveProperty(
				'userId',
				testUser2.uid,
			);
		});

		it('should unblock a user successfully', async () => {
			const response = await agent
				.delete(`/api/users/blocks/${testUser2.uid}`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);

			// Check that user is unblocked
			const checkResponse = await agent
				.get(`/api/users/me/blocks`)
				.set('Authorization', `Bearer ${testUser1.token}`);

			expect(checkResponse.body.data.blockedUsers.length).toBe(0);
		});
	});
});
