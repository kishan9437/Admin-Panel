import { useEffect, useRef, FC, useState } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { KTIcon } from '../../../helpers'
import { getCSSVariableValue } from '../../../assets/ts/_utils'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'
import { useLocation, useParams } from 'react-router-dom'
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker;
type RangeValue<T> = [T | null, T | null] | null;

type Props = {
    className: string
    chartColor: string
    chartHeight: string
}

interface ChartItem {
    totalPages: number;
    renderedPages: number;
    notRenderedPages: number;
    error400Count: number;
    error500Count: number;
}
const UrlChart: FC<Props> = ({ className, chartColor, chartHeight }) => {
    const chartRef = useRef<HTMLDivElement | null>(null)
    const { mode } = useThemeMode()
    const [dateRange, setDateRange] = useState<RangeValue<Dayjs>>(null);
    const location = useLocation();
    const id = location.state.id;
    const [totals, setTotals] = useState({
        totalPages: 0,
        renderedPages: 0,
        notRenderedPages: 0,
        error400Count: 0,
        error500Count: 0,
    });
    const [chartData, setChartData] = useState({
        categories: [] as string[],
        series: {
            total_pages: [] as number[],
            rendered_pages: [] as number[],
            not_rendered_pages: [] as number[],
        }
    })

    const fetchChartData = async (startDate: string, endDate: string) => {
        if (!id) return;
        try {
            const response = await fetch(`http://localhost:5000/api/chart-data?startDate=${startDate}&endDate=${endDate}&id=${id}`);

            const data = await response.json();

            const totals = data.response.reduce((acc: ChartItem, item: ChartItem) => {
                acc.totalPages += item.totalPages || 0;
                acc.renderedPages += item.renderedPages || 0;
                acc.notRenderedPages += item.notRenderedPages || 0;
                acc.error400Count += item.error400Count || 0;
                acc.error500Count += item.error500Count || 0;
                return acc;
            },
                { totalPages: 0, renderedPages: 0, notRenderedPages: 0, error400Count: 0, error500Count: 0 }
            )
            const categories = data.response.map((item: { day: string }) => item.day);
            const series = {
                total_pages: data.response.map((item: { totalPages: number }) => item.totalPages),
                rendered_pages: data.response.map((item: { renderedPages: number }) => item.renderedPages),
                not_rendered_pages: data.response.map((item: { notRenderedPages: number }) => item.notRenderedPages),
            };

            setChartData({ categories, series })
            setTotals(totals);
        } catch (error) {
            console.error('Failed to fetch chart data', error)
        }
    }

    const handleDateRangeChange = (dates: RangeValue<Dayjs>, dateStrings: [string, string]) => {
        setDateRange(dates);
        if (dates && dateStrings[0] && dateStrings[1]) {
            fetchChartData(dateStrings[0], dateStrings[1]);
        }
    };

    useEffect(() => {
        if (!id) return;

        const today = dayjs();
        const startOfWeek = today.startOf('week');
        const endOfWeek = today.endOf('week');

        setDateRange([startOfWeek, endOfWeek]);
        fetchChartData(startOfWeek.format('YYYY-MM-DD'), endOfWeek.format('YYYY-MM-DD'));
    }, [id])

    const refreshChart = () => {
        if (!chartRef.current) {
            return
        }

        const chart1 = new ApexCharts(chartRef.current, chart1Options(chartColor, chartHeight, chartData))
        if (chart1) {
            chart1.render()
        }

        return chart1
    }

    useEffect(() => {
        const chart1 = refreshChart()

        return () => {
            if (chart1) {
                chart1.destroy()
            }
        }
        
    }, [chartRef, mode, chartData])

    return (
        <div className={`card ${className}`}>
            <div className="card-header border-0 py-5">
                <div className="row w-100 align-items-center justify-content-end  g-3 mt-0">
                    <div className="col-12 col-md-6 mt-0 pe-0 ps-0 ">
                        <div className='d-flex justify-content-end'>
                            <RangePicker
                                value={dateRange}
                                format="YYYY-MM-DD"
                                onChange={handleDateRangeChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='card-body d-flex flex-column '>
                <div ref={chartRef} className='mixed-widget-5-chart card-rounded-top' ></div>
                <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3 mt-5'>
                    <div className='col'>
                        <div className='bg-light-warning px-6 py-8 rounded-2'>
                            <KTIcon iconName='chart-simple' className='fs-3x text-warning d-block my-2' />
                            <div className='text-warning fw-semibold fs-6 cursor-pointer'>
                                Total Urls :
                                <span className='ms-2'>{totals.totalPages}</span>
                            </div>
                        </div>
                    </div>
                    <div className='col'>
                        <div className='bg-light-info px-6 py-8 rounded-2'>
                            <KTIcon iconName='sms' className='fs-3x text-info d-block my-2' />
                            <div className='text-info fw-semibold fs-6 mt-2 cursor-pointer'>
                                Rendered :
                                <span className='ms-2'>{totals.renderedPages}</span>
                            </div>
                        </div>
                    </div>
                    <div className='col'>
                        <div className='bg-light-primary px-6 py-8 rounded-2'>
                            <KTIcon iconName='sms' className='fs-3x text-primary d-block my-2' />
                            <div className='text-primary fw-semibold fs-6 mt-2 cursor-pointer'>
                                Not Rendered :
                                <span className='ms-2'>{totals.notRenderedPages}</span>
                            </div>
                        </div>
                    </div>
                    <div className='col'>
                        <div className='bg-light-danger px-6 py-8 rounded-2'>
                            <KTIcon iconName='abstract-26' className='fs-3x text-danger d-block my-2' />
                            <div className='text-danger fw-semibold fs-6 mt-2 cursor-pointer'>
                                400 :
                                <span className='ms-2'>{totals.error400Count}</span>
                            </div>
                        </div>
                    </div>
                    <div className='col'>
                        <div className='bg-light-danger px-6 py-8 rounded-2'>
                            <KTIcon iconName='abstract-26' className='fs-3x text-danger d-block my-2' />
                            <div className='text-danger fw-semibold fs-6 mt-2 cursor-pointer'>
                                500 :
                                <span className='ps-3'>{totals.error500Count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const chart1Options = (chartColor: string, chartHeight: string, data: { categories: string[]; series: { total_pages: number[]; rendered_pages: number[]; not_rendered_pages: number[] } }): ApexOptions => {
    const labelColor = getCSSVariableValue('--bs-gray-800')
    const strokeColor = getCSSVariableValue('--bs-gray-300')

    return {
        series: [
            //{ name: 'Total Pages', data: data.series.total_pages || [0] },
            { name: 'Rendered Pages', data: data.series.rendered_pages || [0] },
            { name: 'Not Rendered Pages', data: data.series.not_rendered_pages || [0] },
        ],
        chart: {
            fontFamily: 'inherit',
            type: 'line',
            height: chartHeight,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
            sparkline: {
                enabled: true,
            },
        },
        plotOptions: {},
        legend: {
            show: false,
        },
        dataLabels: {
            enabled: false,
        },
        fill: {
            type: 'solid',
            opacity: 1,
        },
        stroke: {
            curve: 'smooth',
            show: true,
            width: 3,
            colors: ['#0000FF', '#34cfeb'],
        },
        xaxis: {
            categories: data.categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                show: true,
                style: {
                    colors: labelColor,
                    fontSize: '12px',
                },
            },
            crosshairs: {
                show: false,
                position: 'front',
                stroke: {
                    color: strokeColor,
                    width: 1,
                    dashArray: 3,
                },
            },
            tooltip: {
                enabled: true,
                formatter: undefined,
                offsetY: 0,
                style: {
                    fontSize: '12px',
                },
            },
        },
        yaxis: {
            min: 0,
            // max: Math.max(data.categories) + 10 || 100,
            labels: {
                show: false,
                style: {
                    colors: labelColor,
                    fontSize: '12px',
                },
            },
        },
        states: {
            normal: {
                filter: {
                    type: 'none',
                    value: 0,
                },
            },
            hover: {
                filter: {
                    type: 'none',
                    value: 0,
                },
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'none',
                    value: 0,
                },
            },
        },
        tooltip: {
            style: {
                fontSize: '12px',
            },
            y: {
                formatter: function (val) {
                    return '' + val + ''
                },
            },
        },
        colors: ['#0000FF', '#34cfeb'],
        markers: {
            colors: ['#0000FF', '#34cfeb'],
            strokeColors: ['#0000FF', '#34cfeb'],
            strokeWidth: 3,
        },
    }
}

export { UrlChart }