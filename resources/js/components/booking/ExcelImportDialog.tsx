import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';

interface ExcelRow {
    [key: string]: string | number | undefined;
}

interface ColumnMapping {
    fullname: string;
    age: string;
    cccd: string;
    sdt: string;
    request: string;
}

interface ImportedPassenger {
    fullname: string;
    age: number | null;
    cccd: string;
    phone?: string;
    request?: string;
    type: number; // 0: Adult, 1: Child, 2: Infant
    gender: number;
}

interface ExcelImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (passengers: ImportedPassenger[]) => void;
}

export default function ExcelImportDialog({
    open,
    onOpenChange,
    onImport,
}: ExcelImportDialogProps) {
    const [excelData, setExcelData] = useState<ExcelRow[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({
        fullname: '',
        age: '',
        cccd: '',
        sdt: '',
        request: '',
    });
    const [fileName, setFileName] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    // Xác định loại hành khách dựa trên tuổi
    const getPassengerType = (age: number | null): number => {
        if (age === null) return 0; // Mặc định là người lớn
        if (age >= 12) return 0; // Adult
        if (age >= 5) return 1; // Child
        return 2; // Infant
    };

    // Parse file Excel
    const parseExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
                    defval: '',
                });

                if (jsonData.length > 0) {
                    const cols = Object.keys(jsonData[0]);
                    setColumns(cols);
                    setExcelData(jsonData);
                    setFileName(file.name);

                    // Tự động detect mapping dựa trên tên cột
                    const autoMapping: ColumnMapping = {
                        fullname: '',
                        age: '',
                        cccd: '',
                        sdt: '',
                        request: '',
                    };

                    cols.forEach((col) => {
                        const lowerCol = col.toLowerCase();
                        if (
                            lowerCol.includes('ten') ||
                            lowerCol.includes('tên') ||
                            lowerCol.includes('name') ||
                            lowerCol.includes('họ')
                        ) {
                            autoMapping.fullname = col;
                        }
                        if (
                            lowerCol.includes('tuoi') ||
                            lowerCol.includes('tuổi') ||
                            lowerCol.includes('age')
                        ) {
                            autoMapping.age = col;
                        }
                        if (
                            lowerCol.includes('cccd') ||
                            lowerCol.includes('cmnd') ||
                            lowerCol.includes('căn cước') ||
                            lowerCol.includes('identity')
                        ) {
                            autoMapping.cccd = col;
                        }
                        if (
                            lowerCol.includes('sdt') ||
                            lowerCol.includes('phone') ||
                            lowerCol.includes('điện thoại') ||
                            lowerCol.includes('số điện thoại') ||
                            lowerCol.includes('tel')
                        ) {
                            autoMapping.sdt = col;
                        }
                        if (
                            lowerCol.includes('yêu cầu') ||
                            lowerCol.includes('yeu cau') ||
                            lowerCol.includes('request') ||
                            lowerCol.includes('ghi chú') ||
                            lowerCol.includes('ghi chu') ||
                            lowerCol.includes('note') ||
                            lowerCol.includes('đặc biệt') ||
                            lowerCol.includes('dac biet')
                        ) {
                            autoMapping.request = col;
                        }
                    });

                    setMapping(autoMapping);
                }
            } catch (error) {
                console.error('Lỗi đọc file Excel:', error);
                alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Xử lý kéo thả file
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            parseExcelFile(file);
        } else {
            alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    // Xử lý chọn file
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            parseExcelFile(file);
        }
    };

    // Xử lý import
    const handleImport = () => {
        if (!mapping.fullname) {
            alert('Vui lòng chọn cột Họ và tên!');
            return;
        }

        const passengers: ImportedPassenger[] = excelData.map((row) => {
            const ageValue = mapping.age ? row[mapping.age] : null;
            const age = ageValue ? parseInt(String(ageValue), 10) : null;

            return {
                fullname: String(row[mapping.fullname] || ''),
                age: age && !isNaN(age) ? age : null,
                cccd: mapping.cccd ? String(row[mapping.cccd] || '') : '',
                phone: mapping.sdt ? String(row[mapping.sdt] || '') : '',
                request: mapping.request ? String(row[mapping.request] || '') : '',
                type: getPassengerType(age && !isNaN(age) ? age : null),
                gender: 0, // Mặc định Nam, user có thể chỉnh sau
            };
        }).filter(p => p.fullname.trim() !== ''); // Loại bỏ dòng trống

        onImport(passengers);
        handleReset();
        onOpenChange(false);
    };

    // Reset state
    const handleReset = () => {
        setExcelData([]);
        setColumns([]);
        setMapping({ fullname: '', age: '', cccd: '', sdt: '', request: '' });
        setFileName('');
    };

    // Preview data với mapping
    const getPreviewData = () => {
        return excelData.slice(0, 5).map((row) => ({
            fullname: mapping.fullname ? row[mapping.fullname] : '-',
            age: mapping.age ? row[mapping.age] : '-',
            cccd: mapping.cccd ? row[mapping.cccd] : '-',
            sdt: mapping.sdt ? row[mapping.sdt] : '-',
            request: mapping.request ? row[mapping.request] : '-',
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Import danh sách hành khách từ Excel
                    </DialogTitle>
                    <DialogDescription>
                        Tải lên file Excel chứa thông tin hành khách. Hệ thống sẽ tự
                        động nhận diện các cột phù hợp.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Upload Area */}
                    {!fileName ? (
                        <div
                            className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                                isDragging
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <Upload
                                className={`mb-3 h-10 w-10 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                            />
                            <p className="text-sm font-medium text-gray-700">
                                Kéo thả file Excel vào đây
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                hoặc click để chọn file (.xlsx, .xls)
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">
                                        {fileName}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        {excelData.length} hành khách được tìm thấy
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleReset}
                                className="text-green-700 hover:bg-green-100 hover:text-green-900"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* Column Mapping */}
                    {columns.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">
                                📋 Mapping cột dữ liệu
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <div className="space-y-2">
                                    <Label>
                                        Họ và tên{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={mapping.fullname}
                                        onValueChange={(val) =>
                                            setMapping({ ...mapping, fullname: val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cột..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tuổi</Label>
                                    <Select
                                        value={mapping.age || '__none__'}
                                        onValueChange={(val) =>
                                            setMapping({ ...mapping, age: val === '__none__' ? '' : val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cột..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                -- Không chọn --
                                            </SelectItem>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>CCCD</Label>
                                    <Select
                                        value={mapping.cccd || '__none__'}
                                        onValueChange={(val) =>
                                            setMapping({ ...mapping, cccd: val === '__none__' ? '' : val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cột..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                -- Không chọn --
                                            </SelectItem>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Số điện thoại</Label>
                                    <Select
                                        value={mapping.sdt || '__none__'}
                                        onValueChange={(val) =>
                                            setMapping({ ...mapping, sdt: val === '__none__' ? '' : val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cột..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                -- Không chọn --
                                            </SelectItem>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Yêu cầu đặc biệt</Label>
                                    <Select
                                        value={mapping.request || '__none__'}
                                        onValueChange={(val) =>
                                            setMapping({ ...mapping, request: val === '__none__' ? '' : val })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cột..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                -- Không chọn --
                                            </SelectItem>
                                            {columns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Table */}
                    {mapping.fullname && excelData.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">
                                👁️ Xem trước dữ liệu{' '}
                                <span className="font-normal text-gray-500">
                                    (hiển thị tối đa 5 dòng)
                                </span>
                            </h4>
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Họ và tên</TableHead>
                                            <TableHead className="w-20 text-center">
                                                Tuổi
                                            </TableHead>
                                            <TableHead className="w-36">
                                                CCCD
                                            </TableHead>
                                            <TableHead className="w-32">
                                                SĐT
                                            </TableHead>
                                            <TableHead className="w-40">
                                                Yêu cầu
                                            </TableHead>
                                            <TableHead className="w-28">
                                                Loại
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getPreviewData().map((row, idx) => {
                                            const age =
                                                row.age !== '-'
                                                    ? parseInt(String(row.age), 10)
                                                    : null;
                                            const type = getPassengerType(age);
                                            const typeLabels = [
                                                'Người lớn',
                                                'Trẻ em',
                                                'Em bé',
                                            ];
                                            const typeBadgeColors = [
                                                'bg-blue-100 text-blue-800',
                                                'bg-amber-100 text-amber-800',
                                                'bg-pink-100 text-pink-800',
                                            ];

                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell className="text-gray-500">
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {String(row.fullname)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {row.age !== '-'
                                                            ? row.age
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {row.cccd !== '-'
                                                            ? row.cccd
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {row.sdt !== '-'
                                                            ? row.sdt
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-[150px] truncate" title={row.request !== '-' ? String(row.request) : ''}>
                                                        {row.request !== '-'
                                                            ? row.request
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${typeBadgeColors[type]}`}
                                                        >
                                                            {typeLabels[type]}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            {excelData.length > 5 && (
                                <p className="text-center text-sm text-gray-500">
                                    ... và {excelData.length - 5} hành khách khác
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleReset();
                            onOpenChange(false);
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!mapping.fullname || excelData.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Xác nhận Import ({excelData.length} người)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

