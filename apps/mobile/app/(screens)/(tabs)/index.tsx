import { APP_COLOR } from '@/src/utils/constants';
import React, { useEffect, useMemo, useState } from 'react';
import {
	View,
	StatusBar,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MessageItem from '@/src/components/messages/message.item';
import ShareInput from '@/src/components/input/share.input';
import debounce from 'debounce';

const DATA_MOCKS = [
	{
		id: '1',
		name: 'My Cloud',
		message: 'You: [Link] PTUD_2024_Nhom02_DHKT...',
		time: '28/08',
		avatar: 'https://i.pravatar.cc/100?img=1',
		verified: true,
		unread: 1,
	},
	{
		id: '2',
		name: 'Media Box',
		message: 'Zalo Video: Bắc Ninh trở thành tâm...',
		time: '7 hours',
		avatar: 'https://i.pravatar.cc/100?img=2',
		verified: false,
		unread: 1,
	},
	{
		id: '3',
		name: 'Toàn Nguyễn',
		message: 'okok',
		time: '7 hours',
		avatar: 'https://i.pravatar.cc/100?img=3',
		verified: false,
		unread: 0,
	},
	{
		id: '4',
		name: 'Zalopay',
		message: '(+1) deal nạp game -50% tặng bạn nè',
		time: '8 hours',
		avatar: 'https://i.pravatar.cc/100?img=4',
		verified: true,
		unread: 0,
	},
	{
		id: '5',
		name: 'Zalo',
		message: 'Cập nhật mới nhất từ Zalo',
		time: '19 hours',
		avatar: 'https://i.pravatar.cc/100?img=5',
		verified: true,
		unread: 0,
	},
	{
		id: '6',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '7',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '8',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '9',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '10',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '11',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		unread: 0,
	},
	{
		id: '12',
		name: 'Minh',
		message: '[Sticker]',
		time: 'Wed',
		avatar: 'https://i.pravatar.cc/100?img=6',
		verified: false,
		pinned: false,
		muted: false,
		unread: 0,
	},
];

export default function MessageTab() {
	// const [currentPage, setCurrentPage] = useState<number>(1);
	// const [pageSize, setPageSize] = useState<number>(5);
	// TODO: Xoá sau này dùng redux thay thế
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [search, setSearch] = useState<string>('');

	const debouncedSearch = useMemo(
		() =>
			debounce((text: string) => {
				if (!text) return;
				console.log('fake log search:', text);
			}, 1000),
		[],
	);
	useEffect(() => {
		return () => {
			debouncedSearch.clear();
		};
	}, [debouncedSearch]);

	const handleEndReached = async () => {
		if (!isLoading) {
			setIsLoading(true);
			// setCurrentPage((prev) => prev + 1);
			setTimeout(() => {
				setIsLoading(false);
			}, 3000);
		}
	};
	const fetchInitData = async () => {
		setIsLoading(true);
		// call api from axios (demo 2s)
		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	};
	useEffect(() => {
		fetchInitData();
	}, []);

	const data = useMemo(() => DATA_MOCKS, []);

	return (
		<SafeAreaView edges={['top']} className="flex-1 bg-white">
			<StatusBar
				barStyle="light-content"
				backgroundColor={APP_COLOR.PRIMARY}
			/>
			<View className="bg-primary">
				<View className="p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-1 mr-3">
							<ShareInput
								value={search}
								onTextChange={(text) => {
									setSearch(text);
									debouncedSearch(text);
								}}
								placeholder={'Search...'}
								inputStyle={{
									borderRadius: 10,
									backgroundColor: 'white',
								}}
								clear
							/>
						</View>

						<View className="flex-row">
							<TouchableOpacity className="w-10 h-10 rounded-full bg-gray-500 items-center justify-center mr-2">
								<Ionicons
									name="qr-code"
									size={18}
									color="white"
								/>
							</TouchableOpacity>
							<TouchableOpacity className="w-10 h-10 rounded-full bg-gray-500 items-center justify-center">
								<Ionicons name="add" size={22} color="white" />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
			<FlatList
				data={data}
				keyExtractor={(item) => item.id}
				renderItem={MessageItem}
				className="flex-1"
				onEndReachedThreshold={0.5}
				onEndReached={handleEndReached}
				ListFooterComponent={
					isLoading ? (
						<View className="py-3 items-center justify-center">
							<ActivityIndicator
								size="small"
								color={APP_COLOR.PRIMARY}
								animating={true}
							/>
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
