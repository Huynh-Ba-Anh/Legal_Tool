/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useMemo } from 'react';
import { legalService } from '../services/legal';

interface HhvData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const formatMoney = (value: number) => {
    if (value === null || Number.isNaN(value)) return '--';
    const realPrice = value * 1000;
    return realPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
};

const formatVolume = (value: number) => `${(value / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}K`;
const formatPercent = (value: number | null) =>
    value === null || Number.isNaN(value) ? '--' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const buildSparklinePath = (values: number[], width: number, height: number, min: number, max: number) => {
    if (values.length === 0) return { line: '', area: '', points: [] };
    const diff = max - min || 1;
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / diff) * height;
        return { x, y, value };
    });
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    return { line: linePath, area: areaPath, points };
};

const isInMarketSession = (): boolean => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    return day >= 1 && day <= 5 && timeInMinutes >= 9 * 60 && timeInMinutes < 15 * 60;
};

export function HhvStock() {
    const [data, setData] = useState<HhvData[]>([]);
    const [error, setError] = useState<string | null>(null);
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
            setSessionActive(isInMarketSession());

            if (currentData.length > 0) {
                const newPrice = currentData[0].close;
                if (prevPriceRef.current !== null && prevPriceRef.current !== newPrice) {
                    setFlashClass(
                        newPrice > prevPriceRef.current
                            ? 'animate-[pulse_0.4s_ease-in-out] scale-[1.03] !text-emerald-400 [text-shadow:_0_0_15px_rgba(16,185,129,0.6)]'
                            : 'animate-[pulse_0.4s_ease-in-out] scale-[1.03] !text-rose-400 [text-shadow:_0_0_15px_rgba(244,63,94,0.6)]'
                    );
                    setTimeout(() => setFlashClass(''), 1000);
                }
                prevPriceRef.current = newPrice;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể lấy dữ liệu');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => { fetchData(); }, 60000);
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

    const minPrice = useMemo(() => {
        if (mainSparklineData.length === 0) return 0;
        return Math.min(...mainSparklineData) * 0.995;
    }, [mainSparklineData]);

    const maxPrice = useMemo(() => {
        if (mainSparklineData.length === 0) return 1;
        return Math.max(...mainSparklineData) * 1.005;
    }, [mainSparklineData]);

    const chartWidth = 265;
    const chartHeight = 60;

    const mainSparkline = buildSparklinePath(mainSparklineData, chartWidth, chartHeight, minPrice, maxPrice);

    const isPositive = priceChange >= 0;
    const chartAccent = activeMetric.positive ? '#10b981' : '#ef4444';
    const fillId = activeMetric.positive ? 'gradient-green' : 'gradient-red';

    const yGridLines = useMemo(() => {
        const lines = [];
        const steps = 4;
        const priceDiff = maxPrice - minPrice;
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            lines.push({ y: chartHeight - ratio * chartHeight, price: minPrice + ratio * priceDiff });
        }
        return lines;
    }, [minPrice, maxPrice, chartHeight]);

    const lastPoint = mainSparkline.points.length > 0 ? mainSparkline.points[mainSparkline.points.length - 1] : null;
    const labelX = chartWidth + 6;
    const labelY = lastPoint ? Math.min(Math.max(lastPoint.y - 6, 0), chartHeight - 12) : 0;

    const rangeButtons = (['1D', '5D', '1M', '6M', '1Y', 'ALL'] as const).map((range) => ({ range, label: range }));

    return (
        <>
            {/* Main Widget Card */}
            <div className={`overflow-hidden rounded-xl border border-slate-200/80 p-4 shadow-xs transition-all duration-500 ${isPositive ? 'bg-linear-to-br from-white via-emerald-50/20 to-white' : 'bg-linear-to-br from-white via-rose-50/20 to-white'}`}>

                {/* Header Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                    {/* Left Side: Info & Price */}
                    <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1 shadow-2xs shrink-0">
                                <img src="/Logo.png" alt="logo" className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h1 className="text-base font-bold text-slate-900 tracking-tight">HHV</h1>
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500 tracking-wide">HOSE</span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">Hạ tầng Giao thông Đèo Cả</p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100/80 flex items-center gap-3">
                            <span className={`text-2xl font-extrabold tracking-tight transition-all duration-300 transform-gpu ${flashClass} ${isPositive ? 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.25)]'}`}>
                                {latestData ? formatMoney(latestData.close) : '--'}
                            </span>
                            <span className={`relative text-sm font-extrabold px-2 py-0.5 rounded-md border transition-all duration-300 shrink-0 ${isPositive ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]'}`}>
                                {latestData ? `${isPositive ? '▲ +' : '▼ '}${changePercent}%` : '--'}
                            </span>
                        </div>

                        {/* Thẻ hiển thị thời gian đồng bộ từ DB */}
                        <div className="flex items-center select-none">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500/90 bg-slate-100/60 border border-slate-200/40 px-2 py-1 rounded-md">
                                <span className={`h-2 w-2 rounded-full inline-block shrink-0 ${sessionActive ? 'bg-emerald-600 shadow-[0_0_6px_#10b981]' : 'bg-slate-400'}`} />
                                <span className="text-[11px] font-medium">{sessionActive ? 'Đang giao dịch' : 'Đóng phiên'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Chart Panel */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between min-h-60 shadow-2xs md:col-span-5">
                        <div className="flex items-center justify-end gap-2 border-b border-slate-100 pb-1.5">
                            <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-md">
                                {rangeButtons.map(({ range }) => (
                                    <button key={range} type="button" onClick={() => setSelectedRange(range)} className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-all ${selectedRange === range ? 'bg-slate-950 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}>
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SVG Chart */}
                        <div className="h-40 w-full pt-2 relative">
                            <svg viewBox="0 0 340 60" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
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

                                {/* Các đường kẻ ngang */}
                                {yGridLines.map((line, idx) => (
                                    <g key={idx} className="opacity-40">
                                        <line x1="0" y1={line.y} x2={chartWidth} y2={line.y} stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray={idx === 0 || idx === 4 ? '0' : '3,3'} />
                                        <text x={chartWidth + 6} y={line.y + 3} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="600" textAnchor="start">
                                            {formatMoney(line.price)}
                                        </text>
                                    </g>
                                ))}

                                {mainSparkline.area && <path d={mainSparkline.area} fill={`url(#${fillId})`} className="transition-all duration-300" />}
                                {mainSparkline.line && <path d={mainSparkline.line} fill="none" stroke={chartAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />}

                                {lastPoint && latestData && (
                                    <g>
                                        <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={chartAccent} />
                                        <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill={chartAccent} className="animate-pulse opacity-40" />
                                        <g transform={`translate(${labelX}, ${labelY})`}>
                                            <rect width="40" height="12" rx="2" fill={chartAccent} />
                                            <text x="5" y="9" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="start">
                                                {formatMoney(latestData.close)}
                                            </text>
                                        </g>
                                    </g>
                                )}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Key Financial Metrics */}
                <div className="mt-4 grid grid-cols-5 gap-2 pt-3 border-t border-slate-100">
                    {[
                        { label: 'Mở', value: latestData?.open },
                        { label: 'Cao', value: latestData?.high, highlight: 'text-emerald-600' },
                        { label: 'Thấp', value: latestData?.low, highlight: 'text-rose-600' },
                        { label: 'Đóng', value: latestData?.close, highlight: 'font-bold text-slate-900' },
                        { label: 'Khối lượng', value: latestData?.volume, isVol: true },
                    ].map((item) => (
                        <div key={item.label} className="bg-slate-50/50 rounded-lg p-2 border border-slate-400 text-center flex flex-col justify-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 truncate">{item.label}</p>
                            <p className={`text-xs font-bold text-slate-700 ${item.highlight || ''}`}>
                                {item.value ? (item.isVol ? formatVolume(item.value) : formatMoney(item.value)) : '--'}
                            </p>
                        </div>
                    ))}
                </div>
            </div >

            {/* Bottom Multi-Range Performance Quick-View */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 py-2">
                {metrics.map((metric) => {
                    const miniSparkMin = metric.values.length > 0 ? Math.min(...metric.values) : 0;
                    const miniSparkMax = metric.values.length > 0 ? Math.max(...metric.values) : 1;
                    const miniSpark = buildSparklinePath(metric.values.slice().reverse(), 80, 16, miniSparkMin, miniSparkMax);
                    const isActive = selectedRange === metric.label;

                    return (
                        <button key={metric.label} type="button" onClick={() => setSelectedRange(metric.label)} className={`relative overflow-hidden rounded-xl p-2 border text-left flex flex-col justify-between cursor-pointer group select-none transition-all duration-300 ${isActive ? 'bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-700 text-white scale-[1.05] shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-linear-to-br hover:from-slate-50 hover:to-white hover:shadow-md text-slate-700'}`}>
                            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100 bg-white/5' : 'opacity-0'}`} />

                            <div className="relative flex items-center justify-between w-full text-[10px] font-semibold">
                                <span className={isActive ? 'text-white/60' : 'text-slate-400'}>{metric.label}</span>
                                <span className={`font-bold tracking-tight ${isActive ? 'text-white' : metric.positive ? 'text-emerald-600' : 'text-rose-600'}`}>{metric.value}</span>
                            </div>

                            <div className="relative mt-1.5 h-3.5 w-full overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg viewBox="0 0 80 16" className="h-full w-full" preserveAspectRatio="none">
                                    {miniSpark.line && <path d={miniSpark.line} fill="none" stroke={isActive ? '#ffffff' : metric.positive ? '#10b981' : '#ef4444'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />}
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div >

            {/* Error handling alert */}
            {error && (
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </>
    );
}