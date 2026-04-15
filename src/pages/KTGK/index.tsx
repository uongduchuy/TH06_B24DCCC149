import React, { useEffect, useMemo, useState } from 'react';
import {
	PageContainer,
	ProTable,
	ProColumns,
	ModalForm,
	ProFormText,
	ProFormSelect,
	ProFormDatePicker,
	ProFormCheckbox,
} from '@ant-design/pro-components';
import { Button, Modal, Space, Tag, message } from 'antd';

type OrderStatus = 'Chờ xác nhận' | 'Đang giao' | 'Hoàn thành' | 'Hủy';

type Customer = {
	id: string;
	name: string;
};

type Product = {
	id: string;
	name: string;
	price: number;
};

type Order = {
	id: string;
	customerId: string;
	orderDate: string;
	status: OrderStatus;
	productIds: string[];
	total: number;
};

const ORDER_KEY = 'KTGK_ORDERS';

const customers: Customer[] = [
	{ id: 'c1', name: 'Nguyễn Văn A' },
	{ id: 'c2', name: 'Trần Thị B' },
	{ id: 'c3', name: 'Lê Văn C' },
];

const products: Product[] = [
	{ id: 'p1', name: 'Nước hoa Dior', price: 2500000 },
	{ id: 'p2', name: 'Nước hoa Chanel', price: 3500000 },
	{ id: 'p3', name: 'Nước hoa Versace', price: 1800000 },
	{ id: 'p4', name: 'Nước hoa Gucci', price: 2200000 },
];

const initOrders: Order[] = [
	{
		id: 'DH001',
		customerId: 'c1',
		orderDate: '2026-04-15',
		status: 'Chờ xác nhận',
		productIds: ['p1', 'p3'],
		total: 4300000,
	},
	{
		id: 'DH002',
		customerId: 'c2',
		orderDate: '2026-04-14',
		status: 'Đang giao',
		productIds: ['p2'],
		total: 3500000,
	},
];

function loadOrders(): Order[] {
	const raw = localStorage.getItem(ORDER_KEY);
	if (!raw) return initOrders;

	try {
		return JSON.parse(raw) as Order[];
	} catch {
		return initOrders;
	}
}

function saveOrders(data: Order[]) {
	localStorage.setItem(ORDER_KEY, JSON.stringify(data));
}

function getCustomerName(id: string) {
	return customers.find((c) => c.id === id)?.name || 'Không rõ';
}

function calcTotal(productIds: string[]) {
	let sum = 0;
	productIds.forEach((pid) => {
		const p = products.find((x) => x.id === pid);
		if (p) sum += p.price;
	});
	return sum;
}

export default function KTGK() {
	const [orders, setOrders] = useState<Order[]>([]);

	useEffect(() => {
		setOrders(loadOrders());
	}, []);

	function updateOrders(data: Order[]) {
		saveOrders(data);
		setOrders(data);
	}

	const customerOptions = useMemo(() => {
		return customers.map((c) => ({
			label: c.name,
			value: c.id,
		}));
	}, []);

	const productOptions = useMemo(() => {
		return products.map((p) => ({
			label: `${p.name} (${p.price.toLocaleString()} VNĐ)`,
			value: p.id,
		}));
	}, []);

	const columns: ProColumns<Order>[] = [
		{
			title: 'Mã đơn hàng',
			dataIndex: 'id',
			sorter: (a, b) => a.id.localeCompare(b.id),
		},
		{
			title: 'Khách hàng',
			dataIndex: 'customerId',
			valueType: 'select',
			valueEnum: customerOptions.reduce((acc: any, cur) => {
				acc[cur.value] = { text: cur.label };
				return acc;
			}, {}),
			render: (_, record) => getCustomerName(record.customerId),
		},
		{
			title: 'Ngày đặt hàng',
			dataIndex: 'orderDate',
			sorter: (a, b) => a.orderDate.localeCompare(b.orderDate),
			search: false,
		},
		{
			title: 'Tổng tiền',
			dataIndex: 'total',
			sorter: (a, b) => a.total - b.total,
			search: false,
			render: (_, record) => record.total.toLocaleString() + ' VNĐ',
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			valueType: 'select',
			valueEnum: {
				'Chờ xác nhận': { text: 'Chờ xác nhận' },
				'Đang giao': { text: 'Đang giao' },
				'Hoàn thành': { text: 'Hoàn thành' },
				Hủy: { text: 'Hủy' },
			},
			render: (_, record) => {
				if (record.status === 'Chờ xác nhận') return <Tag color='blue'>Chờ xác nhận</Tag>;
				if (record.status === 'Đang giao') return <Tag color='orange'>Đang giao</Tag>;
				if (record.status === 'Hoàn thành') return <Tag color='green'>Hoàn thành</Tag>;
				return <Tag color='red'>Hủy</Tag>;
			},
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			render: (_, record) => (
				<Space>
					<ModalForm
						title='Chỉnh sửa đơn hàng'
						trigger={<Button type='link'>Sửa</Button>}
						initialValues={record}
						onFinish={async (values: any) => {
							const isDuplicate = orders.some((o) => o.id === values.id && o.id !== record.id);
							if (isDuplicate) {
								message.error('Mã đơn hàng đã tồn tại!');
								return false;
							}

							const total = calcTotal(values.productIds);

							const updated: Order[] = orders.map((o) => {
								if (o.id === record.id) {
									return {
										...o,
										id: values.id,
										customerId: values.customerId,
										orderDate: values.orderDate,
										status: values.status,
										productIds: values.productIds,
										total: total,
									};
								}
								return o;
							});

							updateOrders(updated);
							message.success('Cập nhật đơn hàng thành công');
							return true;
						}}
					>
						<ProFormText name='id' label='Mã đơn hàng' rules={[{ required: true }]} />

						<ProFormSelect
							name='customerId'
							label='Khách hàng'
							options={customerOptions}
							rules={[{ required: true }]}
						/>

						<ProFormDatePicker name='orderDate' label='Ngày đặt hàng' rules={[{ required: true }]} />

						<ProFormCheckbox.Group
							name='productIds'
							label='Sản phẩm'
							options={productOptions}
							rules={[{ required: true, message: 'Phải chọn ít nhất 1 sản phẩm' }]}
						/>

						<ProFormSelect
							name='status'
							label='Trạng thái'
							options={[
								{ label: 'Chờ xác nhận', value: 'Chờ xác nhận' },
								{ label: 'Đang giao', value: 'Đang giao' },
								{ label: 'Hoàn thành', value: 'Hoàn thành' },
								{ label: 'Hủy', value: 'Hủy' },
							]}
							rules={[{ required: true }]}
						/>
					</ModalForm>

					<Button
						danger
						type='link'
						onClick={() => {
							if (record.status !== 'Chờ xác nhận') {
								message.error('Chỉ được hủy đơn ở trạng thái "Chờ xác nhận"');
								return;
							}

							Modal.confirm({
								title: 'Xác nhận hủy đơn',
								content: `Bạn có chắc muốn hủy đơn hàng ${record.id}?`,
								onOk: () => {
									const updated = orders.map((o) => (o.id === record.id ? { ...o, status: 'Hủy' } : o));

									message.success('Đã hủy đơn hàng');
								},
							});
						}}
					>
						Hủy
					</Button>
				</Space>
			),
		},
	];

	function addOrder(values: any) {
		const exist = orders.some((o) => o.id === values.id);
		if (exist) {
			message.error('Mã đơn hàng đã tồn tại!');
			return false;
		}

		const total = calcTotal(values.productIds);

		const newOrder: Order = {
			id: values.id,
			customerId: values.customerId,
			orderDate: values.orderDate,
			status: values.status,
			productIds: values.productIds,
			total: total,
		};

		updateOrders([...orders, newOrder]);
		message.success('Thêm đơn hàng thành công');
		return true;
	}

	return (
		<PageContainer title='KTGK - Quản lý đơn hàng'>
			<ProTable<Order>
				rowKey='id'
				columns={columns}
				dataSource={orders}
				pagination={{ pageSize: 5 }}
				search={{ labelWidth: 'auto' }}
				headerTitle='Danh sách đơn hàng'
				toolBarRender={() => [
					<ModalForm
						key='add'
						title='Thêm đơn hàng'
						trigger={<Button type='primary'>+ Thêm đơn hàng</Button>}
						onFinish={async (values) => {
							return addOrder(values);
						}}
					>
						<ProFormText name='id' label='Mã đơn hàng' rules={[{ required: true }]} />

						<ProFormSelect
							name='customerId'
							label='Khách hàng'
							options={customerOptions}
							rules={[{ required: true }]}
						/>

						<ProFormDatePicker name='orderDate' label='Ngày đặt hàng' rules={[{ required: true }]} />

						<ProFormCheckbox.Group
							name='productIds'
							label='Sản phẩm'
							options={productOptions}
							rules={[{ required: true, message: 'Phải chọn ít nhất 1 sản phẩm' }]}
						/>

						<ProFormSelect
							name='status'
							label='Trạng thái'
							options={[
								{ label: 'Chờ xác nhận', value: 'Chờ xác nhận' },
								{ label: 'Đang giao', value: 'Đang giao' },
								{ label: 'Hoàn thành', value: 'Hoàn thành' },
								{ label: 'Hủy', value: 'Hủy' },
							]}
							rules={[{ required: true }]}
						/>
					</ModalForm>,
				]}
			/>
		</PageContainer>
	);
}
