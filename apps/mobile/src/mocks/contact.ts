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
	{
		id: '4',
		avatar:
			'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		name: 'Knapp Berry',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		id: '5',
		avatar: '',
		name: 'Bell Burgess',
		email: 'nvminh162@gmail.com',
		verified: false,
	},
	{
		id: '6',
		avatar:
			'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
		name: 'Shelby Ballard',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
	{
		id: '7',
		avatar:
			'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		name: 'Bernard Baker',
		email: 'nvminh162@gmail.com',
		verified: false,
	},
	{
		id: '8',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
		name: 'Elma Chapman',
		email: 'nvminh162@gmail.com',
		verified: true,
	},
];
