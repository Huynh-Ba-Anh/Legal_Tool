/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from 'react';
import { legalService } from '../services/legal';

interface HhvData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const formatMoney = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
const formatVolume = (value: number) => `${(value / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}K`;
const formatPercent = (value: number | null) =>
    value === null || Number.isNaN(value)
        ? '--'
        : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const buildSparklinePath = (values: number[], width: number, height: number) => {
    if (values.length === 0) return { line: '', area: '' };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const diff = max - min || 1;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / diff) * height;
        return { x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { line: linePath, area: areaPath };
};

const isInMarketSession = (): boolean => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    return day >= 1 && day <= 5 && timeInMinutes >= 9 * 60 && timeInMinutes < 15 * 60;
};

const formatAbsoluteTime = (timestamp: number): string => {
    if (!timestamp) return '---';
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = date.toLocaleDateString('vi-VN');
    return `${time} - ${dateStr}`;
};

export function HhvStock() {
    const [data, setData] = useState<HhvData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
    const [displayTime, setDisplayTime] = useState<string>('Đang đồng bộ...');
    const [showHistory, setShowHistory] = useState(false);
    const [sessionActive, setSessionActive] = useState(isInMarketSession());
    const [selectedRange, setSelectedRange] = useState<string>('1M');

    const [flashClass, setFlashClass] = useState<string>('');
    const prevPriceRef = useRef<number | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const hhvData = await legalService.getHhvDataCached();
            const currentData = hhvData || [];
            setData(currentData);

            const now = Date.now();
            setLastUpdateTime(now);

            const activeSession = isInMarketSession();
            setSessionActive(activeSession);

            if (currentData.length > 0) {
                const newPrice = currentData[0].close;
                if (prevPriceRef.current !== null && prevPriceRef.current !== newPrice) {
                    if (newPrice > prevPriceRef.current) {
                        setFlashClass('bg-emerald-500/10 text-emerald-600 transition-all duration-200 rounded px-1');
                    } else {
                        setFlashClass('bg-rose-500/10 text-rose-600 transition-all duration-200 rounded px-1');
                    }
                    setTimeout(() => setFlashClass(''), 800);
                }
                prevPriceRef.current = newPrice;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể lấy dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!lastUpdateTime) return;

        const updateTimeDisplay = () => {
            const isNowActive = isInMarketSession();
            setSessionActive(isNowActive);

            if (isNowActive) {
                const diffSec = Math.floor((Date.now() - lastUpdateTime) / 1000);
                let relativeStr = 'Vừa xong';
                if (diffSec >= 60) {
                    const diffMin = Math.floor(diffSec / 60);
                    relativeStr = `${diffMin} phút trước`;
                } else if (diffSec > 0) {
                    relativeStr = `${diffSec} giây trước`;
                }
                setDisplayTime(`Cập nhật: ${relativeStr} (${formatAbsoluteTime(lastUpdateTime)})`);
            } else {
                setDisplayTime(`Đóng phiên - Dữ liệu cuối: ${formatAbsoluteTime(lastUpdateTime)}`);
            }
        };

        updateTimeDisplay();
        const timer = setInterval(updateTimeDisplay, 1000);
        return () => clearInterval(timer);
    }, [lastUpdateTime]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (isInMarketSession()) {
                fetchData();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const latestData = data.length > 0 ? data[0] : null;
    const previousData = data.length > 1 ? data[1] : null;
    const priceChange = latestData && previousData ? latestData.close - previousData.close : 0;
    const changePercent = previousData ? ((priceChange / previousData.close) * 100).toFixed(2) : '0.00';

    const getPctAgo = (index: number) => {
        if (!latestData || data.length <= index) return null;
        const compared = data[index].close;
        return ((latestData.close - compared) / compared) * 100;
    };

    const firstCurrentYear = latestData
        ? [...data].reverse().find((item) => new Date(item.time).getFullYear() === new Date(latestData.time).getFullYear())
        : null;
    const firstAll = data.length > 0 ? data[data.length - 1] : null;

    const pct1D = getPctAgo(1);
    const pct5D = getPctAgo(5);
    const pct1M = getPctAgo(22);
    const pct6M = getPctAgo(126);
    const pct1Y = getPctAgo(252);
    const pctYTD = latestData && firstCurrentYear ? ((latestData.close - firstCurrentYear.close) / firstCurrentYear.close) * 100 : null;
    const pctAll = latestData && firstAll ? ((latestData.close - firstAll.close) / firstAll.close) * 100 : null;

    const metricsConfig: Record<string, { label: string; count: number; value: string; positive: boolean; values: number[] }> = {
        '1D': { label: '1D', count: 2, value: formatPercent(pct1D), positive: pct1D !== null ? pct1D >= 0 : true, values: data.slice(0, 2).map((item) => item.close) },
        '5D': { label: '5D', count: 5, value: formatPercent(pct5D), positive: pct5D !== null ? pct5D >= 0 : true, values: data.slice(0, 5).map((item) => item.close) },
        '1M': { label: '1M', count: 22, value: formatPercent(pct1M), positive: pct1M !== null ? pct1M >= 0 : true, values: data.slice(0, 22).map((item) => item.close) },
        '6M': { label: '6M', count: 126, value: formatPercent(pct6M), positive: pct6M !== null ? pct6M >= 0 : true, values: data.slice(0, 126).map((item) => item.close) },
        'YTD': { label: 'YTD', count: 10, value: formatPercent(pctYTD), positive: pctYTD !== null ? pctYTD >= 0 : true, values: data.slice(0, 10).map((item) => item.close) },
        '1Y': { label: '1Y', count: 252, value: formatPercent(pct1Y), positive: pct1Y !== null ? pct1Y >= 0 : true, values: data.slice(0, 252).map((item) => item.close) },
        'ALL': { label: 'ALL', count: data.length, value: formatPercent(pctAll), positive: pctAll !== null ? pctAll >= 0 : true, values: data.map((item) => item.close) },
    };

    const metrics = Object.values(metricsConfig);
    const activeMetric = metricsConfig[selectedRange] || metricsConfig['1M'];
    const mainSparklineData = activeMetric.values.slice().reverse();
    const mainSparkline = buildSparklinePath(mainSparklineData, 300, 45);

    const isPositive = priceChange >= 0;
    const chartAccent = activeMetric.positive ? '#10b981' : '#ef4444';
    const fillId = activeMetric.positive ? 'gradient-green' : 'gradient-red';

    const rangeButtons = (['1D', '5D', '1M', '6M', '1Y', 'ALL'] as const).map((range) => ({
        range,
        label: range,
    }));

    return (
        <div className="space-y-4 px-2 md:px-4 py-4 max-w-6xl mx-auto bg-slate-50/50 text-sm">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs p-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-center">
                    <div className="lg:col-span-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-14 w-14 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                                <img
                                    src="/Logo.png"
                                    alt="logo"
                                    className="h-10 w-10 object-contain"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <h1 className="text-base font-bold text-slate-900 tracking-tight">HHV</h1>
                                    <span className="px-1 py-0.5 text-[9px] font-semibold rounded bg-slate-100 text-slate-600">HOSE</span>
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate max-w-50">
                                    Hạ tầng Giao thông Đèo Cả
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-baseline gap-x-2 pt-1 border-t border-slate-100 transition-all duration-300 ${flashClass}`}>
                            <span className="text-2xl font-black tracking-tight text-slate-900">
                                {latestData ? formatMoney(latestData.close) : '--'}
                            </span>
                            <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {latestData ? `${isPositive ? '+' : ''}${changePercent}%` : '--'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium border ${sessionActive
                                ? 'bg-blue-50 text-blue-700 border-blue-200/50'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                {sessionActive && (
                                    <span className="relative flex h-1 w-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1 w-1 bg-blue-600"></span>
                                    </span>
                                )}
                                <span className="font-mono">{displayTime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-linear-to-b from-slate-50/50 to-white p-2.5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-25">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đồ thị</span>
                                <div className="flex gap-0.5">
                                    {rangeButtons.map(({ range }) => (
                                        <button
                                            key={range}
                                            onClick={() => setSelectedRange(range)}
                                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition ${selectedRange === range
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{mainSparklineData.length} phiên</span>
                        </div>

                        <div className="h-12 w-full pt-1">
                            <svg viewBox="0 0 300 45" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                                <defs>
                                    <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                    <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                {mainSparkline.area && (
                                    <path d={mainSparkline.area} fill={`url(#${fillId})`} className="transition-all duration-300" />
                                )}
                                {mainSparkline.line && (
                                    <path d={mainSparkline.line} fill="none" stroke={chartAccent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />
                                )}
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-100">
                    {[
                        { label: 'Mở', value: latestData?.open },
                        { label: 'Cao', value: latestData?.high, highlight: 'text-emerald-600' },
                        { label: 'Thấp', value: latestData?.low, highlight: 'text-rose-600' },
                        { label: 'Đóng', value: latestData?.close, highlight: 'font-bold' },
                        { label: 'KL', value: latestData?.volume, isVol: true },
                    ].map((item) => (
                        <div key={item.label} className="bg-slate-50/60 rounded-md p-1.5 border border-slate-100 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                {item.label}
                            </p>
                            <p className={`text-[12px] font-semibold text-slate-800 ${item.highlight || ''}`}>
                                {item.value
                                    ? (item.isVol ? formatVolume(item.value) : formatMoney(item.value))
                                    : '--'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {metrics.map((metric) => {
                    const miniSpark = buildSparklinePath(metric.values.slice().reverse(), 80, 16);
                    const isActive = selectedRange === metric.label;

                    return (
                        <button
                            key={metric.label}
                            type="button"
                            onClick={() => setSelectedRange(metric.label)}
                            className={`rounded-md p-1.5 border text-left shadow-2xs transition-all flex flex-col justify-between cursor-pointer group ${isActive
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                }`}
                        >
                            <div className="flex items-center justify-between gap-1 w-full text-[10px]">
                                <span className="font-bold text-slate-400">{metric.label}</span>
                                <span className={`font-bold ${isActive ? 'text-white' : (metric.positive ? 'text-emerald-600' : 'text-rose-600')}`}>
                                    {metric.value}
                                </span>
                            </div>
                            <div className="mt-1 h-3 w-full overflow-hidden opacity-60 group-hover:opacity-100">
                                <svg viewBox="0 0 80 16" className="h-full w-full" preserveAspectRatio="none">
                                    {miniSpark.line && (
                                        <path
                                            d={miniSpark.line}
                                            fill="none"
                                            stroke={isActive ? '#ffffff' : (metric.positive ? '#10b981' : '#ef4444')}
                                            strokeWidth="1"
                                            strokeLinecap="round"
                                        />
                                    )}
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>

            {error && (
                <div className="rounded-md border border-rose-100 bg-rose-50 p-2 text-[11px] text-rose-700 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xs font-bold text-slate-900 tracking-tight inline-flex items-center gap-2">
                            Lịch sử 10 phiên
                        </h2>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowHistory((prev) => !prev)}
                            className="px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            {showHistory ? 'Ẩn' : 'Xem'}
                        </button>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 disabled:bg-slate-300 cursor-pointer"
                        >
                            {loading ? '...' : 'Tải lại'}
                        </button>
                        <a
                            href="https://finance.vietstock.vn/HHV-ctcp-dau-tu-ha-tang-giao-thong-deo-ca.htm"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Link ↗
                        </a>
                    </div>
                </div>

                {showHistory && (
                    <div className="overflow-x-auto max-h-45 overflow-y-auto">
                        <table className="w-full text-[11px] text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50 shadow-xs z-10">
                                <tr className="border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-3 py-1.5">Ngày</th>
                                    <th className="px-3 py-1.5 text-right">Mở cửa</th>
                                    <th className="px-3 py-1.5 text-right">Cao nhất</th>
                                    <th className="px-3 py-1.5 text-right">Thấp nhất</th>
                                    <th className="px-3 py-1.5 text-right">Đóng cửa</th>
                                    <th className="px-3 py-1.5 text-right">Khối lượng</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {data.slice(0, 10).map((item, idx) => {
                                    const isRowPositive = idx < data.length - 1 ? item.close >= data[idx + 1].close : true;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/60">
                                            <td className="px-3 py-1 text-slate-500 font-mono">
                                                {new Date(item.time).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-3 py-1 text-right font-mono">{formatMoney(item.open)}</td>
                                            <td className="px-3 py-1 text-right text-emerald-600 font-mono">{formatMoney(item.high)}</td>
                                            <td className="px-3 py-1 text-right text-rose-600 font-mono">{formatMoney(item.low)}</td>
                                            <td className={`px-3 py-1 text-right font-mono font-bold ${isRowPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {formatMoney(item.close)}
                                            </td>
                                            <td className="px-3 py-1 text-right text-slate-500 font-mono">{formatVolume(item.volume)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}