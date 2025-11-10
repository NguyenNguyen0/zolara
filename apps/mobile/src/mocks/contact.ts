/**
 * Contact type definition
 */
export type Contact = {
	id: string;
	avatar: string;
	name: string;
	email: string;
	verified?: boolean;
};

/**
 * Mock contact data for testing and development
 */
export const MOCK_CONTACTS: Contact[] = [
	{
		id: '1',
		avatar: '',
		name: 'Larson Ashbee',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		id: '2',
		avatar:
			'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
		name: 'Rosie Arterton',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		id: '3',
		avatar: '',
		name: 'Lorraine Abbott',
		email: 'nvminh162@gmail.com',
		verified: false,
	},
];
