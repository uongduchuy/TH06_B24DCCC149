import React, { useState } from 'react';
import './App.css';
interface CustomField {
	id: string;
	name: string;
	type: 'String' | 'Number' | 'Date';
}
interface Decision {
	id: string;
	soQD: string;
	ngayBanHanh: string;
	trichYeu: string;
	soVanBangId: string;
}
interface Diploma {
	id: string;
	soVaoSo: number;
	soHieuVanBang: string;
	maSinhVien: string;
	hoTen: string;
	ngaySinh: string;
	decisionId: string;
	customFields: Record<string, string | number>;
}
interface DiplomaBook {
	id: string;
	year: number;
}

function App() {
	const [customFields, setCustomFields] = useState<CustomField[]>([
		{ id: '1', name: 'Điểm trung bình', type: 'Number' },
		{ id: '2', name: 'Xếp hạng', type: 'String' },
		{ id: '3', name: 'Nơi sinh', type: 'String' },
	]);
	const [books, setBooks] = useState<DiplomaBook[]>([
		{ id: '1', year: 2024 },
		{ id: '2', year: 2025 },
	]);

	// Quyết định
	const [decisions, setDecisions] = useState<Decision[]>([
		{ id: '1', soQD: 'QĐ-2024-01', ngayBanHanh: '2024-03-15', trichYeu: 'Đợt 1/2024', soVanBangId: '1' },
		{ id: '2', soQD: 'QĐ-2024-02', ngayBanHanh: '2024-07-20', trichYeu: 'Đợt 2/2024', soVanBangId: '1' },
		{ id: '3', soQD: 'QĐ-2025-01', ngayBanHanh: '2025-02-10', trichYeu: 'Đợt 1/2025', soVanBangId: '2' },
	]);
	const [diplomas, setDiplomas] = useState<Diploma[]>([
		{
			id: '1',
			soVaoSo: 1,
			soHieuVanBang: 'VB240001',
			maSinhVien: 'SV001',
			hoTen: 'Nguyễn Văn A',
			ngaySinh: '2002-01-15',
			decisionId: '1',
			customFields: { 'Điểm trung bình': 8.5, 'Xếp hạng': 'Giỏi', 'Nơi sinh': 'Hà Nội' },
		},
		{
			id: '2',
			soVaoSo: 2,
			soHieuVanBang: 'VB240002',
			maSinhVien: 'SV002',
			hoTen: 'Trần Thị B',
			ngaySinh: '2002-05-20',
			decisionId: '1',
			customFields: { 'Điểm trung bình': 7.2, 'Xếp hạng': 'Khá', 'Nơi sinh': 'Hải Phòng' },
		},
	]);
	const [searchStats, setSearchStats] = useState<Record<string, number>>({});
	const [tab, setTab] = useState<'fields' | 'books' | 'decisions' | 'diplomas' | 'search'>('diplomas');
	const [newField, setNewField] = useState({ name: '', type: 'String' as const });
	const [newBook, setNewBook] = useState({ year: new Date().getFullYear() });
	const [newDecision, setNewDecision] = useState({ soQD: '', ngayBanHanh: '', trichYeu: '', soVanBangId: '' });
	const [newDiploma, setNewDiploma] = useState({
		soHieuVanBang: '',
		maSinhVien: '',
		hoTen: '',
		ngaySinh: '',
		decisionId: '',
		customFields: {} as Record<string, string | number>,
	});
	const [searchInput, setSearchInput] = useState({
		soHieuVanBang: '',
		soVaoSo: '',
		maSinhVien: '',
		hoTen: '',
		ngaySinh: '',
	});
	const [searchResult, setSearchResult] = useState<Diploma[]>([]);
	const getNextSoVaoSo = (bookId: string) => {
		const diplomasInBook = diplomas.filter((d) => {
			const dec = decisions.find((dd) => dd.id === d.decisionId);
			return dec?.soVanBangId === bookId;
		});
		return diplomasInBook.length + 1;
	};
	const getDecisionsByBook = (bookId: string) => decisions.filter((d) => d.soVanBangId === bookId);

	const addField = () => {
		if (newField.name) {
			setCustomFields([...customFields, { id: Date.now().toString(), ...newField }]);
			setNewField({ name: '', type: 'String' });
		}
	};

	const deleteField = (id: string) => {
		setCustomFields(customFields.filter((f) => f.id !== id));
	};

	const addBook = () => {
		if (newBook.year) {
			setBooks([...books, { id: Date.now().toString(), year: newBook.year }]);
			setNewBook({ year: new Date().getFullYear() });
		}
	};

	const deleteBook = (id: string) => {
		const hasDecisions = decisions.some((d) => d.soVanBangId === id);
		if (hasDecisions) {
			alert('Không thể xóa sổ vì đã có quyết định!');
			return;
		}
		setBooks(books.filter((b) => b.id !== id));
	};

	const addDecision = () => {
		if (newDecision.soQD && newDecision.ngayBanHanh && newDecision.soVanBangId) {
			setDecisions([...decisions, { id: Date.now().toString(), ...newDecision }]);
			setNewDecision({ soQD: '', ngayBanHanh: '', trichYeu: '', soVanBangId: '' });
		}
	};

	const deleteDecision = (id: string) => {
		const hasDiplomas = diplomas.some((d) => d.decisionId === id);
		if (hasDiplomas) {
			alert('Không thể xóa quyết định vì đã có văn bằng!');
			return;
		}
		setDecisions(decisions.filter((d) => d.id !== id));
	};

	const addDiploma = () => {
		if (
			!newDiploma.soHieuVanBang ||
			!newDiploma.maSinhVien ||
			!newDiploma.hoTen ||
			!newDiploma.ngaySinh ||
			!newDiploma.decisionId
		) {
			alert('Vui lòng nhập đầy đủ thông tin!');
			return;
		}

		const decision = decisions.find((d) => d.id === newDiploma.decisionId);
		if (!decision) return;

		const soVaoSo = getNextSoVaoSo(decision.soVanBangId);

		setDiplomas([
			...diplomas,
			{
				id: Date.now().toString(),
				soVaoSo,
				soHieuVanBang: newDiploma.soHieuVanBang,
				maSinhVien: newDiploma.maSinhVien,
				hoTen: newDiploma.hoTen,
				ngaySinh: newDiploma.ngaySinh,
				decisionId: newDiploma.decisionId,
				customFields: newDiploma.customFields,
			},
		]);

		setNewDiploma({ soHieuVanBang: '', maSinhVien: '', hoTen: '', ngaySinh: '', decisionId: '', customFields: {} });
	};

	const deleteDiploma = (id: string) => {
		setDiplomas(diplomas.filter((d) => d.id !== id));
	};
	const search = () => {
		const filledCount = Object.values(searchInput).filter((v) => v.trim()).length;
		if (filledCount < 2) {
			alert('Vui lòng nhập ít nhất 2 tham số tìm kiếm!');
			return;
		}

		const results = diplomas.filter((d) => {
			if (searchInput.soHieuVanBang && !d.soHieuVanBang.includes(searchInput.soHieuVanBang)) return false;
			if (searchInput.soVaoSo && d.soVaoSo.toString() !== searchInput.soVaoSo) return false;
			if (searchInput.maSinhVien && !d.maSinhVien.includes(searchInput.maSinhVien)) return false;
			if (searchInput.hoTen && !d.hoTen.includes(searchInput.hoTen)) return false;
			if (searchInput.ngaySinh && d.ngaySinh !== searchInput.ngaySinh) return false;
			return true;
		});

		setSearchResult(results);
		const decisionIds = [...new Set(results.map((r) => r.decisionId))];
		decisionIds.forEach((id) => {
			setSearchStats((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
		});
	};

	// ========== RENDER ==========
	return (
		<div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
			<h1 style={{ textAlign: 'center', marginBottom: '20px' }}>QUẢN LÝ VĂN BẰNG TỐT NGHIỆP</h1>

			{/* Tab Menu */}
			<div
				style={{
					display: 'flex',
					gap: '10px',
					marginBottom: '20px',
					borderBottom: '1px solid #ccc',
					paddingBottom: '10px',
				}}
			>
				<button
					onClick={() => setTab('diplomas')}
					style={{
						padding: '8px 16px',
						background: tab === 'diplomas' ? '#007bff' : '#e9ecef',
						color: tab === 'diplomas' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					📋 Văn bằng
				</button>
				<button
					onClick={() => setTab('decisions')}
					style={{
						padding: '8px 16px',
						background: tab === 'decisions' ? '#007bff' : '#e9ecef',
						color: tab === 'decisions' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					📄 Quyết định
				</button>
				<button
					onClick={() => setTab('books')}
					style={{
						padding: '8px 16px',
						background: tab === 'books' ? '#007bff' : '#e9ecef',
						color: tab === 'books' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					📚 Sổ văn bằng
				</button>
				<button
					onClick={() => setTab('fields')}
					style={{
						padding: '8px 16px',
						background: tab === 'fields' ? '#007bff' : '#e9ecef',
						color: tab === 'fields' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					⚙️ Cấu hình
				</button>
				<button
					onClick={() => setTab('search')}
					style={{
						padding: '8px 16px',
						background: tab === 'search' ? '#007bff' : '#e9ecef',
						color: tab === 'search' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					🔍 Tra cứu
				</button>
			</div>

			{/* Tab: Cấu hình trường */}
			{tab === 'fields' && (
				<div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
					<h2>Cấu hình trường thông tin</h2>
					<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
						<input
							type='text'
							placeholder='Tên trường'
							value={newField.name}
							onChange={(e) => setNewField({ ...newField, name: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
						/>
						<select
							value={newField.type}
							onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						>
							<option>String</option>
							<option>Number</option>
							<option>Date</option>
						</select>
						<button
							onClick={addField}
							style={{
								padding: '8px 16px',
								background: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Thêm
						</button>
					</div>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead style={{ background: '#f8f9fa' }}>
							<tr>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên trường</th>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Kiểu</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{customFields.map((f) => (
								<tr key={f.id}>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>{f.name}</td>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>{f.type}</td>
									<td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
										<button
											onClick={() => deleteField(f.id)}
											style={{
												padding: '4px 8px',
												background: '#dc3545',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
											}}
										>
											Xóa
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Tab: Sổ văn bằng */}
			{tab === 'books' && (
				<div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
					<h2>Quản lý sổ văn bằng</h2>
					<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
						<input
							type='number'
							placeholder='Năm'
							value={newBook.year}
							onChange={(e) => setNewBook({ year: parseInt(e.target.value) })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
						<button
							onClick={addBook}
							style={{
								padding: '8px 16px',
								background: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Thêm sổ
						</button>
					</div>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead style={{ background: '#f8f9fa' }}>
							<tr>
								<th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Năm</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{books.map((b) => (
								<tr key={b.id}>
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>{b.year}</td>
									<td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
										<button
											onClick={() => deleteBook(b.id)}
											style={{
												padding: '4px 8px',
												background: '#dc3545',
												color: 'white',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
											}}
										>
											Xóa
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Tab: Quyết định */}
			{tab === 'decisions' && (
				<div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
					<h2>Quản lý quyết định tốt nghiệp</h2>
					<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
						<input
							type='text'
							placeholder='Số QĐ'
							value={newDecision.soQD}
							onChange={(e) => setNewDecision({ ...newDecision, soQD: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
						/>
						<input
							type='date'
							value={newDecision.ngayBanHanh}
							onChange={(e) => setNewDecision({ ...newDecision, ngayBanHanh: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
						<input
							type='text'
							placeholder='Trích yếu'
							value={newDecision.trichYeu}
							onChange={(e) => setNewDecision({ ...newDecision, trichYeu: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
						/>
						<select
							value={newDecision.soVanBangId}
							onChange={(e) => setNewDecision({ ...newDecision, soVanBangId: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						>
							<option value=''>Chọn sổ</option>
							{books.map((b) => (
								<option key={b.id} value={b.id}>
									Năm {b.year}
								</option>
							))}
						</select>
						<button
							onClick={addDecision}
							style={{
								padding: '8px 16px',
								background: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Thêm
						</button>
					</div>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead style={{ background: '#f8f9fa' }}>
							<tr>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Số QĐ</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Ngày ban hành</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Trích yếu</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Thuộc sổ</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{decisions.map((d) => {
								const book = books.find((b) => b.id === d.soVanBangId);
								return (
									<tr key={d.id}>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.soQD}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.ngayBanHanh}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.trichYeu}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{book ? `Năm ${book.year}` : '—'}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
											<button
												onClick={() => deleteDecision(d.id)}
												style={{
													padding: '4px 8px',
													background: '#dc3545',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													cursor: 'pointer',
												}}
											>
												Xóa
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* Tab: Văn bằng */}
			{tab === 'diplomas' && (
				<div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
					<h2>Quản lý văn bằng tốt nghiệp</h2>

					{/* Form thêm mới */}
					<div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
						<h3>Thêm văn bằng mới</h3>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
								gap: '10px',
								marginBottom: '10px',
							}}
						>
							<input
								type='text'
								placeholder='Số hiệu văn bằng'
								value={newDiploma.soHieuVanBang}
								onChange={(e) => setNewDiploma({ ...newDiploma, soHieuVanBang: e.target.value })}
								style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
							/>
							<input
								type='text'
								placeholder='Mã sinh viên'
								value={newDiploma.maSinhVien}
								onChange={(e) => setNewDiploma({ ...newDiploma, maSinhVien: e.target.value })}
								style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
							/>
							<input
								type='text'
								placeholder='Họ tên'
								value={newDiploma.hoTen}
								onChange={(e) => setNewDiploma({ ...newDiploma, hoTen: e.target.value })}
								style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
							/>
							<input
								type='date'
								placeholder='Ngày sinh'
								value={newDiploma.ngaySinh}
								onChange={(e) => setNewDiploma({ ...newDiploma, ngaySinh: e.target.value })}
								style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
							/>
							<select
								value={newDiploma.decisionId}
								onChange={(e) => setNewDiploma({ ...newDiploma, decisionId: e.target.value })}
								style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
							>
								<option value=''>Chọn quyết định</option>
								{decisions.map((d) => (
									<option key={d.id} value={d.id}>
										{d.soQD} - {d.trichYeu}
									</option>
								))}
							</select>
						</div>

						{/* Trường động */}
						{customFields.length > 0 && (
							<div style={{ marginTop: '10px' }}>
								<strong>Thông tin bổ sung:</strong>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
										gap: '10px',
										marginTop: '5px',
									}}
								>
									{customFields.map((field) => (
										<div key={field.id}>
											<label style={{ fontSize: '12px', display: 'block' }}>{field.name}</label>
											{field.type === 'Number' && (
												<input
													type='number'
													onChange={(e) =>
														setNewDiploma({
															...newDiploma,
															customFields: { ...newDiploma.customFields, [field.name]: parseFloat(e.target.value) },
														})
													}
													style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
												/>
											)}
											{field.type === 'Date' && (
												<input
													type='date'
													onChange={(e) =>
														setNewDiploma({
															...newDiploma,
															customFields: { ...newDiploma.customFields, [field.name]: e.target.value },
														})
													}
													style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
												/>
											)}
											{field.type === 'String' && (
												<input
													type='text'
													onChange={(e) =>
														setNewDiploma({
															...newDiploma,
															customFields: { ...newDiploma.customFields, [field.name]: e.target.value },
														})
													}
													style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
												/>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						<button
							onClick={addDiploma}
							style={{
								marginTop: '10px',
								padding: '8px 16px',
								background: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							Thêm văn bằng
						</button>
					</div>

					{/* Danh sách văn bằng */}
					<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
						<thead style={{ background: '#f8f9fa' }}>
							<tr>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Số vào sổ</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Số hiệu</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>MSV</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Họ tên</th>
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Ngày sinh</th>
								{customFields.map((f) => (
									<th key={f.id} style={{ border: '1px solid #ddd', padding: '8px' }}>
										{f.name}
									</th>
								))}
								<th style={{ border: '1px solid #ddd', padding: '8px' }}>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{diplomas.map((d) => {
								const decision = decisions.find((dec) => dec.id === d.decisionId);
								return (
									<tr key={d.id}>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.soVaoSo}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.soHieuVanBang}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.maSinhVien}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.hoTen}</td>
										<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.ngaySinh}</td>
										{customFields.map((f) => (
											<td key={f.id} style={{ border: '1px solid #ddd', padding: '8px' }}>
												{d.customFields[f.name] || '—'}
											</td>
										))}
										<td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
											<button
												onClick={() => deleteDiploma(d.id)}
												style={{
													padding: '4px 8px',
													background: '#dc3545',
													color: 'white',
													border: 'none',
													borderRadius: '4px',
													cursor: 'pointer',
												}}
											>
												Xóa
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* Tab: Tra cứu */}
			{tab === 'search' && (
				<div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
					<h2>Tra cứu văn bằng</h2>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
							gap: '10px',
							marginBottom: '20px',
						}}
					>
						<input
							type='text'
							placeholder='Số hiệu văn bằng'
							value={searchInput.soHieuVanBang}
							onChange={(e) => setSearchInput({ ...searchInput, soHieuVanBang: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
						<input
							type='text'
							placeholder='Số vào sổ'
							value={searchInput.soVaoSo}
							onChange={(e) => setSearchInput({ ...searchInput, soVaoSo: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
						<input
							type='text'
							placeholder='Mã sinh viên'
							value={searchInput.maSinhVien}
							onChange={(e) => setSearchInput({ ...searchInput, maSinhVien: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
						<input
							type='text'
							placeholder='Họ tên'
							value={searchInput.hoTen}
							onChange={(e) => setSearchInput({ ...searchInput, hoTen: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
						<input
							type='date'
							placeholder='Ngày sinh'
							value={searchInput.ngaySinh}
							onChange={(e) => setSearchInput({ ...searchInput, ngaySinh: e.target.value })}
							style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
						/>
					</div>
					<button
						onClick={search}
						style={{
							padding: '8px 16px',
							background: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							marginRight: '10px',
						}}
					>
						Tìm kiếm
					</button>

					{/* Kết quả tra cứu */}
					{searchResult.length > 0 && (
						<div style={{ marginTop: '20px' }}>
							<h3>Kết quả tìm thấy ({searchResult.length})</h3>
							<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
								<thead style={{ background: '#f8f9fa' }}>
									<tr>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>Số vào sổ</th>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>Số hiệu VB</th>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>MSV</th>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>Họ tên</th>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>Ngày sinh</th>
										{customFields.map((f) => (
											<th key={f.id} style={{ border: '1px solid #ddd', padding: '8px' }}>
												{f.name}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{searchResult.map((d) => (
										<tr key={d.id}>
											<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.soVaoSo}</td>
											<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.soHieuVanBang}</td>
											<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.maSinhVien}</td>
											<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.hoTen}</td>
											<td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.ngaySinh}</td>
											{customFields.map((f) => (
												<td key={f.id} style={{ border: '1px solid #ddd', padding: '8px' }}>
													{d.customFields[f.name] || '—'}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* Thống kê lượt tra cứu */}
					{Object.keys(searchStats).length > 0 && (
						<div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
							<h3>Thống kê lượt tra cứu theo quyết định</h3>
							<table style={{ width: '100%', borderCollapse: 'collapse' }}>
								<thead>
									<tr>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>Quyết định</th>
										<th style={{ border: '1px solid #ddd', padding: '8px' }}>Số lượt tra cứu</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(searchStats).map(([decisionId, count]) => {
										const decision = decisions.find((d) => d.id === decisionId);
										return (
											<tr key={decisionId}>
												<td style={{ border: '1px solid #ddd', padding: '8px' }}>{decision?.soQD || decisionId}</td>
												<td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{count}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default App;
