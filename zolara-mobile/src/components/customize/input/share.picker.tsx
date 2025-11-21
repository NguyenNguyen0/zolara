import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLOR } from '@/utils/constants';

export interface PickerItem {
	label: string;
	value: string;
	icon?: React.ReactNode; // Optional icon/image để hiển thị bên cạnh label
}

interface SharePickerProps {
	open: boolean;
	value: string | null;
	items: PickerItem[];
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setValue: React.Dispatch<React.SetStateAction<string | null>>;
	setItems: React.Dispatch<React.SetStateAction<PickerItem[]>>;
	placeholder?: string;
	zIndex?: number;
	renderTrigger?: (selectedItem: PickerItem | undefined, open: boolean) => React.ReactNode; // Custom trigger
}

const SharePicker: React.FC<SharePickerProps> = ({
	open,
	value,
	items,
	setOpen,
	setValue,
	placeholder = 'Select...',
	renderTrigger,
}) => {

	const selectedItem = items.find(item => item.value === value);

	const handleSelect = (itemValue: string) => {
		setValue(itemValue);
		setOpen(false);
	};

	return (
		<View>
			{/* Trigger Button - có thể custom hoặc dùng mặc định */}
			{renderTrigger ? (
				<TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}>
					{renderTrigger(selectedItem, open)}
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					onPress={() => setOpen(!open)}
					style={{
						backgroundColor: APP_COLOR.LIGHT_MODE,
						borderColor: open ? APP_COLOR.PRIMARY : APP_COLOR.GRAY_200,
						borderWidth: 2,
						borderRadius: 8,
						minHeight: 56,
						paddingHorizontal: 16,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
					activeOpacity={0.7}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
						{selectedItem?.icon && selectedItem.icon}
						<Text
							style={{
								fontSize: 16,
								color: selectedItem
									? APP_COLOR.DARK_MODE
									: APP_COLOR.GRAY_500,
							}}
						>
							{selectedItem ? selectedItem.label : placeholder}
						</Text>
					</View>
					<Ionicons
						name={open ? 'chevron-up' : 'chevron-down'}
						size={20}
						color={APP_COLOR.DARK_MODE}
					/>
				</TouchableOpacity>
			)}

			{/* Modal with Options */}
			<Modal
				visible={open}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setOpen(false)}
				statusBarTranslucent={true}
			>
				<TouchableOpacity
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.6)',
						justifyContent: 'flex-end',
					}}
					activeOpacity={1}
					onPress={() => setOpen(false)}
				>
					<View
						style={{
							backgroundColor: APP_COLOR.LIGHT_MODE,
							borderTopLeftRadius: 16,
							borderTopRightRadius: 16,
							paddingTop: 4,
							width: '100%',
							maxHeight: '50%',
							shadowColor: '#000',
							shadowOffset: { width: 0, height: -4 },
							shadowOpacity: 0.3,
							shadowRadius: 8,
							elevation: 8,
						}}
						onStartShouldSetResponder={() => true}
					>
						{/* Header */}
						<View style={{ 
							flexDirection: 'row', 
							justifyContent: 'space-between', 
							alignItems: 'center',
							paddingHorizontal: 16,
							paddingVertical: 12,
							borderBottomWidth: 1,
							borderBottomColor: APP_COLOR.GRAY_200,
						}}>
							<Text style={{
								fontSize: 18,
								fontWeight: '600',
								color: APP_COLOR.DARK_MODE,
							}}>
								{placeholder}
							</Text>
							<TouchableOpacity onPress={() => setOpen(false)}>
								<Ionicons name="close" size={24} color={APP_COLOR.DARK_MODE} />
							</TouchableOpacity>
						</View>

						{/* Options List */}
						<FlatList
							data={items}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => (
								<TouchableOpacity
									onPress={() => handleSelect(item.value)}
									style={{
										paddingVertical: 16,
										paddingHorizontal: 16,
										marginHorizontal: 8,
										marginVertical: 4,
										borderRadius: 8,
										backgroundColor: item.value === value ? APP_COLOR.PRIMARY + '20' : 'transparent',
									}}
									activeOpacity={0.7}
								>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
											{item.icon && item.icon}
											<Text
												style={{
													fontSize: 16,
													color: APP_COLOR.DARK_MODE,
													fontWeight: item.value === value ? '600' : '400',
												}}
											>
												{item.label}
											</Text>
										</View>
										{item.value === value && (
											<Ionicons name="checkmark-circle" size={24} color={APP_COLOR.PRIMARY} />
										)}
									</View>
								</TouchableOpacity>
							)}
							contentContainerStyle={{ 
								paddingVertical: 8
							}}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

export default SharePicker;
