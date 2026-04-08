import React, { useEffect, useMemo, useState } from 'react';
import {
	PageContainer,
	ProTable,
	ProColumns,
	ModalForm,
	ProFormText,
	ProFormTextArea,
	ProFormDigit,
	ProFormSelect,
} from '@ant-design/pro-components';
import {
	Card,
	Col,
	Row,
	Rate,
	Select,
	Button,
	Space,
	Typography,
	Tag,
	message,
	Modal,
	Tabs,
	InputNumber,
	Alert,
	Progress,
} from 'antd';

// ======================
// TYPE
// ======================
type TravelType = 'Biển' | 'Núi' | 'Thành phố';

type Destination = {
	id: string;
	name: string;
	location: string;
	type: TravelType;
	rating: number;
	description: string;

	visitHours: number;

	foodCost: number;
	hotelCost: number;
	transportCost: number;
};

type ItineraryItem = {
	id: string;
	day: number;
	destinationId: string;
};

type Budget = {
	total: number;
	food: number;
	hotel: number;
	transport: number;
	other: number;
};

// ======================
// LOCAL STORAGE KEY
// ======================
const DEST_KEY = 'TH06_DESTINATIONS';
const PLAN_KEY = 'TH06_ITINERARY';
const BUDGET_KEY = 'TH06_BUDGET';

// ======================
// UTILS
// ======================
function genId() {
	return Date.now().toString() + Math.floor(Math.random() * 100000).toString();
}

function loadData<T>(key: string, defaultValue: T): T {
	const raw = localStorage.getItem(key);
	if (!raw) return defaultValue;

	try {
		return JSON.parse(raw) as T;
	} catch {
		return defaultValue;
	}
}

function saveData<T>(key: string, data: T) {
	localStorage.setItem(key, JSON.stringify(data));
}

// ======================
// INIT DATA
// ======================
const initDestinations: Destination[] = [
	{
		id: 'd1',
		name: 'Đà Nẵng',
		location: 'Miền Trung',
		type: 'Biển',
		rating: 4.5,
		description: 'Thành phố biển đẹp, có cầu Rồng, biển Mỹ Khê.',
		visitHours: 6,
		foodCost: 700000,
		hotelCost: 1500000,
		transportCost: 1200000,
	},
	{
		id: 'd2',
		name: 'Sapa',
		location: 'Lào Cai',
		type: 'Núi',
		rating: 4.7,
		description: 'Vùng núi đẹp, có Fansipan, bản Cát Cát.',
		visitHours: 8,
		foodCost: 800000,
		hotelCost: 1800000,
		transportCost: 1400000,
	},
	{
		id: 'd3',
		name: 'Hà Nội',
		location: 'Miền Bắc',
		type: 'Thành phố',
		rating: 4.3,
		description: 'Thủ đô với phố cổ, hồ Gươm, ẩm thực phong phú.',
		visitHours: 5,
		foodCost: 600000,
		hotelCost: 1200000,
		transportCost: 700000,
	},
];

const initBudget: Budget = {
	total: 6000000,
	food: 1500000,
	hotel: 2500000,
	transport: 1500000,
	other: 500000,
};

// ======================
// MAIN COMPONENT
// ======================
export default function TH06() {
	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
	const [budget, setBudget] = useState<Budget>(initBudget);

	// filter / sort
	const [filterType, setFilterType] = useState<string>('All');
	const [sortBy, setSortBy] = useState<string>('rating_desc');

	useEffect(() => {
		setDestinations(loadData(DEST_KEY, initDestinations));
		setItinerary(loadData(PLAN_KEY, []));
		setBudget(loadData(BUDGET_KEY, initBudget));
	}, []);

	function saveDest(data: Destination[]) {
		saveData(DEST_KEY, data);
		setDestinations(data);
	}

	function savePlan(data: ItineraryItem[]) {
		saveData(PLAN_KEY, data);
		setItinerary(data);
	}

	function saveBudgetData(data: Budget) {
		saveData(BUDGET_KEY, data);
		setBudget(data);
	}
	const filteredDestinations = useMemo(() => {
		let data = [...destinations];

		if (filterType !== 'All') {
			data = data.filter((d) => d.type === filterType);
		}

		if (sortBy === 'rating_desc') {
			data.sort((a, b) => b.rating - a.rating);
		}

		if (sortBy === 'food_asc') {
			data.sort((a, b) => a.foodCost - b.foodCost);
		}

		return data;
	}, [destinations, filterType, sortBy]);

	// ======================
	// ITINERARY CALC
	// ======================
	const itineraryDetails = useMemo(() => {
		return itinerary.map((item) => {
			const des = destinations.find((d) => d.id === item.destinationId);
			return { ...item, destination: des };
		});
	}, [itinerary, destinations]);

	const totalFood = useMemo(() => {
		return itineraryDetails.reduce((sum, x) => sum + (x.destination?.foodCost || 0), 0);
	}, [itineraryDetails]);

	const totalHotel = useMemo(() => {
		return itineraryDetails.reduce((sum, x) => sum + (x.destination?.hotelCost || 0), 0);
	}, [itineraryDetails]);

	const totalTransport = useMemo(() => {
		return itineraryDetails.reduce((sum, x) => sum + (x.destination?.transportCost || 0), 0);
	}, [itineraryDetails]);

	const totalPlanCost = totalFood + totalHotel + totalTransport;

	const totalVisitHours = useMemo(() => {
		return itineraryDetails.reduce((sum, x) => sum + (x.destination?.visitHours || 0), 0);
	}, [itineraryDetails]);

	const travelTime = useMemo(() => {
		if (itineraryDetails.length <= 1) return 0;
		return (itineraryDetails.length - 1) * 2;
	}, [itineraryDetails]);

	// ======================
	// BUDGET CHECK
	// ======================
	const budgetUsed = budget.food + budget.hotel + budget.transport + budget.other;

	const percentUsed = useMemo(() => {
		if (budget.total === 0) return 0;
		return Math.round((budgetUsed / budget.total) * 100);
	}, [budgetUsed, budget.total]);

	const isOverBudget = budgetUsed > budget.total;

	// ======================
	// ITINERARY ACTION
	// ======================
	function addToItinerary(day: number, destinationId: string) {
		const newItem: ItineraryItem = {
			id: genId(),
			day,
			destinationId,
		};

		savePlan([...itinerary, newItem]);
		message.success('Đã thêm vào lịch trình');
	}

	function removeItem(id: string) {
		const updated = itinerary.filter((x) => x.id !== id);
		savePlan(updated);
		message.success('Đã xóa');
	}

	function moveUp(index: number) {
		if (index === 0) return;
		const updated = [...itinerary];
		const temp = updated[index];
		updated[index] = updated[index - 1];
		updated[index - 1] = temp;
		savePlan(updated);
	}

	function moveDown(index: number) {
		if (index === itinerary.length - 1) return;
		const updated = [...itinerary];
		const temp = updated[index];
		updated[index] = updated[index + 1];
		updated[index + 1] = temp;
		savePlan(updated);
	}

	// ======================
	// ADMIN COLUMNS
	// ======================
	const adminColumns: ProColumns<Destination>[] = [
		{ title: 'Tên điểm đến', dataIndex: 'name' },
		{ title: 'Địa điểm', dataIndex: 'location', search: false },
		{ title: 'Loại', dataIndex: 'type' },
		{
			title: 'Rating',
			dataIndex: 'rating',
			search: false,
			render: (_, record) => <Rate disabled allowHalf value={record.rating} />,
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			render: (_, record) => (
				<Space>
					<ModalForm<Destination>
						title='Sửa điểm đến'
						trigger={<Button type='link'>Sửa</Button>}
						initialValues={record}
						onFinish={async (values) => {
							const updated = destinations.map((d) => (d.id === record.id ? { ...d, ...values } : d));
							saveDest(updated);
							message.success('Cập nhật thành công');
							return true;
						}}
					>
						<ProFormText name='name' label='Tên điểm đến' rules={[{ required: true }]} />
						<ProFormText name='location' label='Địa điểm' rules={[{ required: true }]} />

						<ProFormSelect
							name='type'
							label='Loại hình'
							rules={[{ required: true }]}
							options={[
								{ label: 'Biển', value: 'Biển' },
								{ label: 'Núi', value: 'Núi' },
								{ label: 'Thành phố', value: 'Thành phố' },
							]}
						/>

						<ProFormDigit name='rating' label='Rating' rules={[{ required: true }]} />

						<ProFormDigit name='visitHours' label='Thời gian tham quan (giờ)' rules={[{ required: true }]} />

						<ProFormTextArea name='description' label='Mô tả' rules={[{ required: true }]} />

						<ProFormDigit name='foodCost' label='Chi ăn uống' rules={[{ required: true }]} />
						<ProFormDigit name='hotelCost' label='Chi lưu trú' rules={[{ required: true }]} />
						<ProFormDigit name='transportCost' label='Chi di chuyển' rules={[{ required: true }]} />
					</ModalForm>

					<Button
						danger
						type='link'
						onClick={() => {
							Modal.confirm({
								title: 'Xóa điểm đến',
								content: `Bạn có chắc muốn xóa "${record.name}"?`,
								onOk: () => {
									const updated = destinations.filter((d) => d.id !== record.id);
									saveDest(updated);
									message.success('Đã xóa');
								},
							});
						}}
					>
						Xóa
					</Button>
				</Space>
			),
		},
	];

	// ======================
	// ADMIN STAT
	// ======================
	const popularStats = useMemo(() => {
		const map: Record<string, number> = {};
		itinerary.forEach((i) => {
			map[i.destinationId] = (map[i.destinationId] || 0) + 1;
		});

		return destinations
			.map((d) => ({
				name: d.name,
				count: map[d.id] || 0,
			}))
			.sort((a, b) => b.count - a.count);
	}, [itinerary, destinations]);

	// ======================
	// UI
	// ======================
	return (
		<PageContainer title='TH06 - Lập kế hoạch du lịch'>
			<Tabs defaultActiveKey='1'>
				{/* TAB 1 */}
				<Tabs.TabPane tab='Trang chủ' key='1'>
					<Card style={{ marginBottom: 16 }}>
						<Row gutter={[16, 16]}>
							<Col xs={24} md={12}>
								<Typography.Text>Loại hình</Typography.Text>
								<Select
									style={{ width: '100%' }}
									value={filterType}
									onChange={(value) => setFilterType(value)}
									options={[
										{ label: 'Tất cả', value: 'All' },
										{ label: 'Biển', value: 'Biển' },
										{ label: 'Núi', value: 'Núi' },
										{ label: 'Thành phố', value: 'Thành phố' },
									]}
								/>
							</Col>

							<Col xs={24} md={12}>
								<Typography.Text>Sắp xếp</Typography.Text>
								<Select
									style={{ width: '100%' }}
									value={sortBy}
									onChange={(value) => setSortBy(value)}
									options={[
										{ label: 'Rating cao → thấp', value: 'rating_desc' },
										{ label: 'Chi ăn uống thấp → cao', value: 'food_asc' },
									]}
								/>
							</Col>
						</Row>
					</Card>

					<Row gutter={[16, 16]}>
						{filteredDestinations.map((d) => (
							<Col xs={24} sm={12} md={8} lg={6} key={d.id}>
								<Card hoverable>
									<Typography.Title level={5}>{d.name}</Typography.Title>

									<p>
										<b>Địa điểm:</b> {d.location}
									</p>

									<Tag color='blue'>{d.type}</Tag>

									<p style={{ marginTop: 8 }}>
										<b>Thời gian tham quan:</b> {d.visitHours} giờ
									</p>

									<p>
										<b>Chi phí ăn uống:</b> {d.foodCost.toLocaleString()} VNĐ
									</p>
									<p>
										<b>Chi phí lưu trú:</b> {d.hotelCost.toLocaleString()} VNĐ
									</p>
									<p>
										<b>Chi phí di chuyển:</b> {d.transportCost.toLocaleString()} VNĐ
									</p>

									<Rate disabled allowHalf value={d.rating} />

									<div style={{ marginTop: 12 }}>
										<ModalForm
											title='Thêm vào lịch trình'
											trigger={
												<Button type='primary' block>
													+ Thêm
												</Button>
											}
											onFinish={async (values: any) => {
												addToItinerary(values.day, d.id);
												return true;
											}}
										>
											<ProFormDigit name='day' label='Ngày' min={1} rules={[{ required: true }]} />
										</ModalForm>
									</div>
								</Card>
							</Col>
						))}
					</Row>
				</Tabs.TabPane>

				{/* TAB 2 */}
				<Tabs.TabPane tab='Lịch trình' key='2'>
					<Card style={{ marginBottom: 16 }}>
						<p>
							<b>Tổng chi phí:</b> {totalPlanCost.toLocaleString()} VNĐ
						</p>
						<p>
							<b>Tổng thời gian tham quan:</b> {totalVisitHours} giờ
						</p>
						<p>
							<b>Thời gian di chuyển (ước tính):</b> {travelTime} giờ
						</p>
					</Card>

					{itineraryDetails.length === 0 ? (
						<Alert message='Chưa có lịch trình. Hãy thêm điểm đến từ Trang chủ.' type='info' />
					) : (
						itineraryDetails.map((it, index) => (
							<Card key={it.id} style={{ marginBottom: 12 }}>
								<Row gutter={[16, 16]} align='middle'>
									<Col xs={24} md={16}>
										<Typography.Title level={5}>
											Ngày {it.day} - {it.destination?.name}
										</Typography.Title>

										<p>
											<b>Chi phí:</b>{' '}
											{(
												(it.destination?.foodCost || 0) +
												(it.destination?.hotelCost || 0) +
												(it.destination?.transportCost || 0)
											).toLocaleString()}{' '}
											VNĐ
										</p>
									</Col>

									<Col xs={24} md={8}>
										<Space>
											<Button onClick={() => moveUp(index)}>↑</Button>
											<Button onClick={() => moveDown(index)}>↓</Button>
											<Button danger onClick={() => removeItem(it.id)}>
												Xóa
											</Button>
										</Space>
									</Col>
								</Row>
							</Card>
						))
					)}
				</Tabs.TabPane>

				{/* TAB 3 */}
				<Tabs.TabPane tab='Ngân sách' key='3'>
					<Card style={{ marginBottom: 16 }} title='Thiết lập ngân sách'>
						<Row gutter={[16, 16]}>
							<Col xs={24} md={8}>
								<Typography.Text>Tổng ngân sách</Typography.Text>
								<InputNumber
									style={{ width: '100%' }}
									value={budget.total}
									onChange={(val) => saveBudgetData({ ...budget, total: Number(val) })}
								/>
							</Col>

							<Col xs={24} md={8}>
								<Typography.Text>Ăn uống</Typography.Text>
								<InputNumber
									style={{ width: '100%' }}
									value={budget.food}
									onChange={(val) => saveBudgetData({ ...budget, food: Number(val) })}
								/>
							</Col>

							<Col xs={24} md={8}>
								<Typography.Text>Lưu trú</Typography.Text>
								<InputNumber
									style={{ width: '100%' }}
									value={budget.hotel}
									onChange={(val) => saveBudgetData({ ...budget, hotel: Number(val) })}
								/>
							</Col>

							<Col xs={24} md={8}>
								<Typography.Text>Di chuyển</Typography.Text>
								<InputNumber
									style={{ width: '100%' }}
									value={budget.transport}
									onChange={(val) => saveBudgetData({ ...budget, transport: Number(val) })}
								/>
							</Col>

							<Col xs={24} md={8}>
								<Typography.Text>Khác</Typography.Text>
								<InputNumber
									style={{ width: '100%' }}
									value={budget.other}
									onChange={(val) => saveBudgetData({ ...budget, other: Number(val) })}
								/>
							</Col>
						</Row>
					</Card>

					{isOverBudget && (
						<Alert
							type='error'
							message='Cảnh báo vượt ngân sách!'
							description={`Đã dùng: ${budgetUsed.toLocaleString()} VNĐ / Tổng: ${budget.total.toLocaleString()} VNĐ`}
							style={{ marginBottom: 16 }}
						/>
					)}

					<Card title='Tình trạng ngân sách'>
						<p>
							<b>Đã dùng:</b> {budgetUsed.toLocaleString()} VNĐ
						</p>

						<Progress percent={percentUsed} status={isOverBudget ? 'exception' : 'active'} />
					</Card>
				</Tabs.TabPane>

				{/* TAB 4 */}
				<Tabs.TabPane tab='Admin' key='4'>
					<ProTable<Destination>
						rowKey='id'
						columns={adminColumns}
						dataSource={destinations}
						search={{ labelWidth: 'auto' }}
						pagination={{ pageSize: 5 }}
						headerTitle='Quản lý điểm đến'
						toolBarRender={() => [
							<ModalForm<Destination>
								key='addDest'
								title='Thêm điểm đến'
								trigger={<Button type='primary'>+ Thêm điểm đến</Button>}
								onFinish={async (values) => {
									const newDest: Destination = {
										id: genId(),
										name: values.name,
										location: values.location,
										type: values.type,
										rating: values.rating,
										description: values.description,
										visitHours: values.visitHours,
										foodCost: values.foodCost,
										hotelCost: values.hotelCost,
										transportCost: values.transportCost,
									};

									saveDest([...destinations, newDest]);
									message.success('Thêm thành công');
									return true;
								}}
							>
								<ProFormText name='name' label='Tên điểm đến' rules={[{ required: true }]} />
								<ProFormText name='location' label='Địa điểm' rules={[{ required: true }]} />

								<ProFormSelect
									name='type'
									label='Loại hình'
									rules={[{ required: true }]}
									options={[
										{ label: 'Biển', value: 'Biển' },
										{ label: 'Núi', value: 'Núi' },
										{ label: 'Thành phố', value: 'Thành phố' },
									]}
								/>

								<ProFormDigit name='rating' label='Rating' rules={[{ required: true }]} />
								<ProFormDigit name='visitHours' label='Thời gian tham quan (giờ)' rules={[{ required: true }]} />

								<ProFormTextArea name='description' label='Mô tả' rules={[{ required: true }]} />

								<ProFormDigit name='foodCost' label='Chi ăn uống' rules={[{ required: true }]} />
								<ProFormDigit name='hotelCost' label='Chi lưu trú' rules={[{ required: true }]} />
								<ProFormDigit name='transportCost' label='Chi di chuyển' rules={[{ required: true }]} />
							</ModalForm>,
						]}
					/>

					<Card style={{ marginTop: 16 }} title='Thống kê'>
						<p>
							<b>Số điểm đến:</b> {destinations.length}
						</p>

						<p>
							<b>Số mục lịch trình đã tạo:</b> {itinerary.length}
						</p>

						<p>
							<b>Địa điểm phổ biến nhất:</b> {popularStats.length > 0 ? popularStats[0].name : 'Chưa có'}
						</p>
					</Card>
				</Tabs.TabPane>
			</Tabs>
		</PageContainer>
	);
}
