import React, { useEffect, useMemo, useState } from 'react';
import {
	PageContainer,
	ProTable,
	ProColumns,
	ModalForm,
	ProFormText,
	ProFormTextArea,
	ProFormSwitch,
} from '@ant-design/pro-components';
import { Button, Modal, Space, Tabs, Tag, message, Typography, Card } from 'antd';

// ========================
// TYPE
// ========================
type Club = {
	id: string;
	name: string;
	foundedDate: string;
	description: string; // HTML
	president: string;
	active: boolean;
};

type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

type Registration = {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	gender: 'Nam' | 'Nữ';
	address: string;
	talent: string;
	clubId: string;
	reason: string;
	status: RegistrationStatus;
	note?: string;
};

type History = {
	id: string;
	registrationId: string;
	action: 'Approved' | 'Rejected';
	time: string;
	note?: string;
};

// ========================
// LOCAL STORAGE KEY
// ========================
const CLUB_KEY = 'TH05_CLUBS';
const REG_KEY = 'TH05_REGS';
const HIS_KEY = 'TH05_HISTORY';

// ========================
// LOAD - SAVE LOCAL STORAGE
// ========================
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

// ========================
// INIT DATA
// ========================
const initClubs: Club[] = [
	{
		id: 'clb1',
		name: 'CLB Lập trình',
		foundedDate: '2020-10-10',
		description: '<b>CLB học lập trình</b> dành cho sinh viên',
		president: 'Nguyễn Văn A',
		active: true,
	},
	{
		id: 'clb2',
		name: 'CLB Bóng đá',
		foundedDate: '2018-05-20',
		description: '<i>CLB thể thao</i> rèn luyện sức khỏe',
		president: 'Trần Văn B',
		active: true,
	},
];

const initRegs: Registration[] = [
	{
		id: 'r1',
		fullName: 'Lê Minh Huy',
		email: 'huy@gmail.com',
		phone: '0988888888',
		gender: 'Nam',
		address: 'Hà Nội',
		talent: 'JavaScript',
		clubId: 'clb1',
		reason: 'Muốn học thêm kỹ năng',
		status: 'Pending',
	},
	{
		id: 'r2',
		fullName: 'Nguyễn Thị Lan',
		email: 'lan@gmail.com',
		phone: '0977777777',
		gender: 'Nữ',
		address: 'Hà Nội',
		talent: 'Bóng đá',
		clubId: 'clb2',
		reason: 'Đam mê thể thao',
		status: 'Approved',
	},
];

// ========================
// GEN ID
// ========================
function genId(): string {
	return Date.now().toString() + Math.floor(Math.random() * 100000).toString();
}

// ========================
// MAIN COMPONENT
// ========================
export default function TH05() {
	const [clubs, setClubs] = useState<Club[]>([]);
	const [regs, setRegs] = useState<Registration[]>([]);
	const [history, setHistory] = useState<History[]>([]);

	const [selectedRegKeys, setSelectedRegKeys] = useState<React.Key[]>([]);
	const [selectedMemberKeys, setSelectedMemberKeys] = useState<React.Key[]>([]);

	// LOAD DATA
	useEffect(() => {
		setClubs(loadData(CLUB_KEY, initClubs));
		setRegs(loadData(REG_KEY, initRegs));
		setHistory(loadData(HIS_KEY, []));
	}, []);

	function saveClubsData(data: Club[]) {
		saveData(CLUB_KEY, data);
		setClubs(data);
	}

	function saveRegsData(data: Registration[]) {
		saveData(REG_KEY, data);
		setRegs(data);
	}

	function saveHistoryData(data: History[]) {
		saveData(HIS_KEY, data);
		setHistory(data);
	}

	// ========================
	// CLUB MAP
	// ========================
	const clubMap = useMemo(() => {
		const map: Record<string, string> = {};
		clubs.forEach((c) => {
			map[c.id] = c.name;
		});
		return map;
	}, [clubs]);

	// ========================
	// TAB 1: CLUB LIST
	// ========================
	const clubColumns: ProColumns<Club>[] = [
		{
			title: 'Tên CLB',
			dataIndex: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
		{
			title: 'Ngày thành lập',
			dataIndex: 'foundedDate',
			search: false,
			sorter: (a, b) => a.foundedDate.localeCompare(b.foundedDate),
		},
		{
			title: 'Mô tả (HTML)',
			dataIndex: 'description',
			search: false,
			render: (_, record) => <div dangerouslySetInnerHTML={{ __html: record.description }} />,
		},
		{
			title: 'Chủ nhiệm',
			dataIndex: 'president',
		},
		{
			title: 'Hoạt động',
			dataIndex: 'active',
			valueType: 'select',
			valueEnum: {
				true: { text: 'Có' },
				false: { text: 'Không' },
			},
			render: (_, record) => (record.active ? <Tag color='green'>Có</Tag> : <Tag color='red'>Không</Tag>),
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			render: (_, record) => (
				<Space>
					{/* SỬA */}
					<ModalForm<Club>
						title='Sửa CLB'
						trigger={<Button type='link'>Sửa</Button>}
						initialValues={record}
						onFinish={async (values) => {
							const updatedClubs: Club[] = clubs.map((c) => (c.id === record.id ? { ...c, ...values } : c));

							saveClubsData(updatedClubs);
							message.success('Cập nhật CLB thành công');
							return true;
						}}
					>
						<ProFormText name='name' label='Tên CLB' rules={[{ required: true }]} />
						<ProFormText name='foundedDate' label='Ngày thành lập' rules={[{ required: true }]} />
						<ProFormTextArea name='description' label='Mô tả (HTML)' rules={[{ required: true }]} />
						<ProFormText name='president' label='Chủ nhiệm' rules={[{ required: true }]} />
						<ProFormSwitch name='active' label='Hoạt động' />
					</ModalForm>

					{/* XÓA */}
					<Button
						danger
						type='link'
						onClick={() => {
							Modal.confirm({
								title: 'Xóa CLB',
								content: `Bạn có chắc muốn xóa CLB "${record.name}"?`,
								onOk: () => {
									const updatedClubs: Club[] = clubs.filter((c) => c.id !== record.id);
									saveClubsData(updatedClubs);
									message.success('Xóa CLB thành công');
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

	// ========================
	// TAB 2: REGISTRATION LIST
	// ========================
	const regColumns: ProColumns<Registration>[] = [
		{ title: 'Họ tên', dataIndex: 'fullName' },
		{ title: 'Email', dataIndex: 'email', search: false },
		{ title: 'SĐT', dataIndex: 'phone', search: false },
		{ title: 'Giới tính', dataIndex: 'gender', search: false },
		{
			title: 'CLB',
			dataIndex: 'clubId',
			render: (_, record) => clubMap[record.clubId] || record.clubId,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			valueEnum: {
				Pending: { text: 'Pending' },
				Approved: { text: 'Approved' },
				Rejected: { text: 'Rejected' },
			},
			render: (_, record) => {
				if (record.status === 'Pending') return <Tag color='blue'>Pending</Tag>;
				if (record.status === 'Approved') return <Tag color='green'>Approved</Tag>;
				return <Tag color='red'>Rejected</Tag>;
			},
		},
		{
			title: 'Lý do',
			dataIndex: 'reason',
			search: false,
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
			search: false,
		},
		{
			title: 'Thao tác',
			valueType: 'option',
			render: (_, record) => (
				<Space>
					{/* DUYỆT */}
					<Button
						type='link'
						onClick={() => {
							Modal.confirm({
								title: 'Duyệt đơn',
								content: `Duyệt đơn của "${record.fullName}"?`,
								onOk: () => {
									const updatedRegs: Registration[] = regs.map((r) => {
										if (r.id === record.id) {
											return { ...r, status: 'Approved' as RegistrationStatus, note: '' };
										}
										return r;
									});

									const newHis: History = {
										id: genId(),
										registrationId: record.id,
										action: 'Approved',
										time: new Date().toLocaleString(),
									};

									saveRegsData(updatedRegs);
									saveHistoryData([...history, newHis]);
									message.success('Đã duyệt đơn');
								},
							});
						}}
					>
						Duyệt
					</Button>

					{/* TỪ CHỐI */}
					<Button
						danger
						type='link'
						onClick={() => {
							let rejectReason = '';

							Modal.confirm({
								title: 'Từ chối đơn',
								content: (
									<div>
										<Typography.Text>Nhập lý do từ chối:</Typography.Text>
										<input
											style={{ width: '100%', marginTop: 10, padding: 8 }}
											placeholder='Nhập lý do...'
											onChange={(e) => (rejectReason = e.target.value)}
										/>
									</div>
								),
								onOk: () => {
									if (!rejectReason.trim()) {
										message.error('Bắt buộc nhập lý do từ chối!');
										return Promise.reject();
									}

									const updatedRegs: Registration[] = regs.map((r) => {
										if (r.id === record.id) {
											return {
												...r,
												status: 'Rejected' as RegistrationStatus,
												note: rejectReason,
											};
										}
										return r;
									});

									const newHis: History = {
										id: genId(),
										registrationId: record.id,
										action: 'Rejected',
										time: new Date().toLocaleString(),
										note: rejectReason,
									};

									saveRegsData(updatedRegs);
									saveHistoryData([...history, newHis]);
									message.success('Đã từ chối đơn');
								},
							});
						}}
					>
						Từ chối
					</Button>

					{/* XÓA */}
					<Button
						danger
						type='link'
						onClick={() => {
							Modal.confirm({
								title: 'Xóa đơn',
								content: `Bạn có chắc muốn xóa đơn của "${record.fullName}"?`,
								onOk: () => {
									const updatedRegs: Registration[] = regs.filter((r) => r.id !== record.id);
									saveRegsData(updatedRegs);
									message.success('Xóa đơn thành công');
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

	// Duyệt nhiều đơn
	function approveSelected() {
		if (selectedRegKeys.length === 0) {
			message.error('Bạn chưa chọn đơn nào');
			return;
		}

		Modal.confirm({
			title: 'Duyệt nhiều đơn',
			content: `Duyệt ${selectedRegKeys.length} đơn đã chọn?`,
			onOk: () => {
				const now = new Date().toLocaleString();

				const updatedRegs: Registration[] = regs.map((r) => {
					if (selectedRegKeys.includes(r.id)) {
						return { ...r, status: 'Approved' as RegistrationStatus, note: '' };
					}
					return r;
				});

				const newHis: History[] = selectedRegKeys.map((id) => ({
					id: genId(),
					registrationId: String(id),
					action: 'Approved',
					time: now,
				}));

				saveRegsData(updatedRegs);
				saveHistoryData([...history, ...newHis]);
				setSelectedRegKeys([]);
				message.success('Duyệt thành công');
			},
		});
	}

	// Từ chối nhiều đơn
	function rejectSelected() {
		if (selectedRegKeys.length === 0) {
			message.error('Bạn chưa chọn đơn nào');
			return;
		}

		let rejectReason = '';

		Modal.confirm({
			title: 'Từ chối nhiều đơn',
			content: (
				<div>
					<Typography.Text>Nhập lý do từ chối:</Typography.Text>
					<input
						style={{ width: '100%', marginTop: 10, padding: 8 }}
						placeholder='Nhập lý do...'
						onChange={(e) => (rejectReason = e.target.value)}
					/>
				</div>
			),
			onOk: () => {
				if (!rejectReason.trim()) {
					message.error('Bắt buộc nhập lý do từ chối!');
					return Promise.reject();
				}

				const now = new Date().toLocaleString();

				const updatedRegs: Registration[] = regs.map((r) => {
					if (selectedRegKeys.includes(r.id)) {
						return {
							...r,
							status: 'Rejected' as RegistrationStatus,
							note: rejectReason,
						};
					}
					return r;
				});

				const newHis: History[] = selectedRegKeys.map((id) => ({
					id: genId(),
					registrationId: String(id),
					action: 'Rejected',
					time: now,
					note: rejectReason,
				}));

				saveRegsData(updatedRegs);
				saveHistoryData([...history, ...newHis]);
				setSelectedRegKeys([]);
				message.success('Từ chối thành công');
			},
		});
	}

	// ========================
	// TAB 3: MEMBER LIST
	// ========================
	const approvedMembers = useMemo(() => {
		return regs.filter((r) => r.status === 'Approved');
	}, [regs]);

	const memberColumns: ProColumns<Registration>[] = [
		{ title: 'Họ tên', dataIndex: 'fullName' },
		{ title: 'Email', dataIndex: 'email', search: false },
		{ title: 'SĐT', dataIndex: 'phone', search: false },
		{
			title: 'CLB',
			dataIndex: 'clubId',
			render: (_, record) => clubMap[record.clubId] || record.clubId,
		},
	];

	function changeClubForMembers() {
		if (selectedMemberKeys.length === 0) {
			message.error('Bạn chưa chọn thành viên nào');
			return;
		}

		let newClubId = '';

		Modal.confirm({
			title: 'Đổi CLB cho thành viên',
			content: (
				<div>
					<Typography.Text>Chọn CLB muốn chuyển đến:</Typography.Text>
					<select style={{ width: '100%', padding: 8, marginTop: 10 }} onChange={(e) => (newClubId = e.target.value)}>
						<option value=''>-- Chọn CLB --</option>
						{clubs.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
			),
			onOk: () => {
				if (!newClubId) {
					message.error('Bạn phải chọn CLB');
					return Promise.reject();
				}

				const updatedRegs: Registration[] = regs.map((r) => {
					if (selectedMemberKeys.includes(r.id)) {
						return { ...r, clubId: newClubId };
					}
					return r;
				});

				saveRegsData(updatedRegs);
				setSelectedMemberKeys([]);
				message.success('Chuyển CLB thành công');
			},
		});
	}

	// ========================
	// TAB 4: REPORT
	// ========================
	const pendingCount = regs.filter((r) => r.status === 'Pending').length;
	const approvedCount = regs.filter((r) => r.status === 'Approved').length;
	const rejectedCount = regs.filter((r) => r.status === 'Rejected').length;

	return (
		<PageContainer title='TH05 - Quản lý CLB'>
			<Tabs defaultActiveKey='1'>
				<Tabs.TabPane tab='Danh sách CLB' key='1'>
					<ProTable<Club>
						rowKey='id'
						columns={clubColumns}
						dataSource={clubs}
						search={{ labelWidth: 'auto' }}
						pagination={{ pageSize: 5 }}
						headerTitle='Danh sách CLB'
						toolBarRender={() => [
							<ModalForm<Club>
								key='addClub'
								title='Thêm CLB'
								trigger={<Button type='primary'>+ Thêm CLB</Button>}
								onFinish={async (values) => {
									const newClub: Club = {
										id: genId(),
										name: values.name,
										foundedDate: values.foundedDate,
										description: values.description,
										president: values.president,
										active: values.active ?? true,
									};

									saveClubsData([...clubs, newClub]);
									message.success('Thêm CLB thành công');
									return true;
								}}
							>
								<ProFormText name='name' label='Tên CLB' rules={[{ required: true }]} />
								<ProFormText name='foundedDate' label='Ngày thành lập' rules={[{ required: true }]} />
								<ProFormTextArea name='description' label='Mô tả (HTML)' rules={[{ required: true }]} />
								<ProFormText name='president' label='Chủ nhiệm' rules={[{ required: true }]} />
								<ProFormSwitch name='active' label='Hoạt động' initialValue={true} />
							</ModalForm>,
						]}
					/>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Đơn đăng ký' key='2'>
					<Space style={{ marginBottom: 12 }}>
						<Button type='primary' onClick={approveSelected}>
							Duyệt {selectedRegKeys.length} đơn
						</Button>
						<Button danger onClick={rejectSelected}>
							Từ chối {selectedRegKeys.length} đơn
						</Button>
					</Space>

					<ProTable<Registration>
						rowKey='id'
						columns={regColumns}
						dataSource={regs}
						search={{ labelWidth: 'auto' }}
						pagination={{ pageSize: 5 }}
						rowSelection={{
							selectedRowKeys: selectedRegKeys,
							onChange: (keys) => setSelectedRegKeys(keys),
						}}
					/>

					<Card style={{ marginTop: 16 }} title='Lịch sử duyệt/từ chối'>
						{history.length === 0 ? (
							<Typography.Text>Chưa có lịch sử</Typography.Text>
						) : (
							history.map((h) => (
								<div key={h.id} style={{ marginBottom: 6 }}>
									<b>{h.action}</b> | đơn: <b>{h.registrationId}</b> | lúc {h.time}
									{h.note ? ` | Lý do: ${h.note}` : ''}
								</div>
							))
						)}
					</Card>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Thành viên CLB' key='3'>
					<Space style={{ marginBottom: 12 }}>
						<Button type='primary' onClick={changeClubForMembers}>
							Đổi CLB cho {selectedMemberKeys.length} thành viên
						</Button>
					</Space>

					<ProTable<Registration>
						rowKey='id'
						columns={memberColumns}
						dataSource={approvedMembers}
						search={{ labelWidth: 'auto' }}
						pagination={{ pageSize: 5 }}
						rowSelection={{
							selectedRowKeys: selectedMemberKeys,
							onChange: (keys) => setSelectedMemberKeys(keys),
						}}
					/>
				</Tabs.TabPane>

				<Tabs.TabPane tab='Báo cáo' key='4'>
					<Card title='Thống kê đơn đăng ký'>
						<p>
							<b>Tổng số CLB:</b> {clubs.length}
						</p>
						<p>
							<b>Pending:</b> {pendingCount}
						</p>
						<p>
							<b>Approved:</b> {approvedCount}
						</p>
						<p>
							<b>Rejected:</b> {rejectedCount}
						</p>

						<hr />

						<Typography.Title level={5}>Thống kê theo CLB</Typography.Title>

						{clubs.map((c) => {
							const p = regs.filter((r) => r.clubId === c.id && r.status === 'Pending').length;
							const a = regs.filter((r) => r.clubId === c.id && r.status === 'Approved').length;
							const rj = regs.filter((r) => r.clubId === c.id && r.status === 'Rejected').length;

							return (
								<p key={c.id}>
									<b>{c.name}</b> | Pending: {p} | Approved: {a} | Rejected: {rj}
								</p>
							);
						})}
					</Card>
				</Tabs.TabPane>
			</Tabs>
		</PageContainer>
	);
}
