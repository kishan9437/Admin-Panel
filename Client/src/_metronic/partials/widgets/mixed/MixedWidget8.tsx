import { useEffect, useRef, FC, useState } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { KTIcon } from '../../../helpers'
import { getCSSVariableValue } from '../../../assets/ts/_utils'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'
import { Link, useNavigate } from 'react-router-dom'
import { DatePicker } from 'antd';
// import 'antd/es/date-picker/style/index.css';
import React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const { RangePicker } = DatePicker;
type RangeValue<T> = [T | null, T | null] | null;
type Props = {
  className: string
  chartColor: string
  chartHeight: string
}

interface UrlChartData {
  days: string;
  totalUrl: number;
  renderedUrl: number;
  notRenderedUrl: number;
  error400Count: number;
  error500Count: number;
}

interface UrlChartItem {
  id: string;
  name: string;
  url: string;
  days: string;
  totalUrl: number;
  renderedUrl: number;
  notRenderedUrl: number;
  error400Count: number;
  error500Count: number;
  data: UrlChartData[];
}

const MixedWidget8: FC<Props> = ({ className, chartColor, chartHeight }) => {
  const [chartRefs, setChartRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const { mode } = useThemeMode()
  const navigate = useNavigate();
  const [data, setData] = useState<UrlChartItem[]>([]);
  const [dateRanges, setDateRanges] = useState<Record<string, RangeValue<Dayjs> | null>>({});
  const [chartData, setChartData] = useState<Record<string, UrlChartItem>>({});

  const fetchChartData = async (
    startDate?: Date,
    endDate?: Date,
    id?: string
  ) => {
    try {
      console.log('Fetching chart data with:', { startDate, endDate });

      if (!startDate || !endDate) {
        console.error('Start date or end date is missing');
        return;
      }

      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      const response = await fetch(`http://localhost:5000/api/get-url-chart?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const result = await response.json();

      if (id && typeof id === "string") {
        // Update only the specific chart's data
        setChartData((prev) => ({
          ...prev,
          [id]: result.items.find((item: UrlChartItem) => item.id === id),
        }));
      } else {
        setData(result.items || [])
      }
      console.log(result.items);
      setChartRefs(result.items.map(() => React.createRef<HTMLDivElement>()));

    } catch (error) {
      console.error('Failed to fetch chart data', error)
    }
  }

  useEffect(() => {
    const initialRange: RangeValue<Dayjs> = [dayjs().startOf("week"), dayjs().endOf("week")];

    const initialRanges: Record<string, RangeValue<Dayjs> | null> = {};

    data.forEach((item) => {
      initialRanges[item.id] = initialRange;
    });
    setDateRanges(initialRanges);
    fetchChartData(initialRange[0]?.toDate(), initialRange[1]?.toDate());
  }, []);

  const handleDateRangeChange = (dates: RangeValue<Dayjs>, dateStrings: [string, string], id: string) => {
    setDateRanges((prev) => ({
      ...prev,
      [id]: dates,
    }));

    if (dates && dates[0] && dates[1]) {
      fetchChartData(dates[0].toDate(), dates[1].toDate(), id);
    }
  };

  useEffect(() => {
    const chartInstances: Record<string, ApexCharts> = {};

    Object.keys(chartData).forEach((id) => {
      const chartRef = chartRefs[data.findIndex((item) => item.id === id)]?.current;

      if (chartRef) {
        const item = chartData[id];
        if (item) {
          const chart = new ApexCharts(
            chartRef,
            chart1Options(chartColor, chartHeight, {
              categories: item.data.map((d: UrlChartData) => d.days),
              series: {
                total_pages: item.data.map((d: UrlChartData) => d.totalUrl),
                rendered_pages: item.data.map((d: UrlChartData) => d.renderedUrl),
                not_rendered_pages: item.data.map((d: UrlChartData) => d.notRenderedUrl),
              },
            })
          );

          chart.render();
          chartInstances[id] = chart;
        }
      }
    });
    return () => {
      Object.values(chartInstances).forEach((chart) => chart.destroy());
    };
  }, [chartData, chartRefs, mode, chartColor, chartHeight, data]);

  const handleError400 = (id: string) => {
    navigate(`/400Error?id=${id}`)
  }

  const handleError500 = (id: string) => {
    navigate(`/500Error?id=${id}`)
  }

  const handleRender = (id: string) => {
    navigate(`/websiteurl/${id}`)
  }

  const handleNotRender = (id: string) => {
    navigate(`/websiteurl/${id}`)
  }

  const handleTotal = (id: string) => {
    navigate(`/websiteurl/${id}`)
  }

  return (
    <div className={`card ${className}`}>
      {data.map((item, index) => (
        <div key={index}>
          <div className="card-header border-0 py-5">
            <div className="row w-100 align-items-center  g-3 mt-0">
              <div className="col-12 col-md-6 mt-0 pe-0">
                <Link to="/websiteurl"
                  state={{ id: item.id, name: item.name, url: item.url, previousPath: "/dashboard" }}
                  className='breadcrumb-icon'
                >
                  <div className="d-flex align-items-center flex-wrap me-0 py-2">
                    <div className="card-label fw-bold fs-5 me-0">
                      <div className='d-flex'>
                        <h5 className='m-0'>{item.name}</h5>
                        <div className='ms-2'>
                          <FontAwesomeIcon icon={faArrowRight}  className='breadcrumb-icon-arrow  ps-1' />
                        </div>
                      </div>
                      <span className='text-muted text-truncate d-block'> {item.url}</span>
                    </div>
                  </div>
                </Link>

              </div>
              <div className="col-12 col-md-6 mt-0 pe-0 ps-0 justify-content-end">
                <div className='d-flex justify-content-end'>
                  <RangePicker
                    key={item.id}
                    value={dateRanges[item.id] || null}
                    format="YYYY-MM-DD"
                    onChange={(dates, dateStrings) => handleDateRangeChange(dates, dateStrings, item.id)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='card-body d-flex flex-column '>
            <div ref={chartRefs[index]} className='mixed-widget-5-chart card-rounded-top' ></div>
            {/* <div ref={chartRef} className='mixed-widget-5-chart card-rounded-top' ></div> */}
            <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3 mt-5'>
              <div className='col'>
                <div className='bg-light-warning px-6 py-8 rounded-2'>
                  <KTIcon iconName='chart-simple' className='fs-3x text-warning d-block my-2' />
                  <div onClick={() => handleTotal(item.id)} className='text-warning fw-semibold fs-6 cursor-pointer'>
                    Total Urls :
                    <span className='ms-2'>{chartData[item.id]?.data.reduce((sum: number, d: UrlChartData) => sum + d.totalUrl, 0) || 0}</span>
                  </div>
                </div>
              </div>
              <div className='col'>
                <div className='bg-light-info px-6 py-8 rounded-2'>
                  <KTIcon iconName='sms' className='fs-3x text-info d-block my-2' />
                  <div onClick={() => handleRender(item.id)} className='text-info fw-semibold fs-6 mt-2 cursor-pointer'>
                    Rendered :
                    <span className='ms-2'>{chartData[item.id]?.data.reduce((sum: number, d: UrlChartData) => sum + d.renderedUrl, 0) || 0}</span>
                  </div>
                </div>
              </div>
              <div className='col'>
                <div className='bg-light-primary px-6 py-8 rounded-2'>
                  <KTIcon iconName='sms' className='fs-3x text-primary d-block my-2' />
                  <div onClick={() => handleNotRender(item.id)} className='text-primary fw-semibold fs-6 mt-2 cursor-pointer'>
                    Not Rendered :
                    <span className='ms-2'>{chartData[item.id]?.data.reduce((sum: number, d: UrlChartData) => sum + d.notRenderedUrl, 0) || 0}</span>
                  </div>
                </div>
              </div>
              <div className='col'>
                <div className='bg-light-danger px-6 py-8 rounded-2'>
                  <KTIcon iconName='abstract-26' className='fs-3x text-danger d-block my-2' />
                  <div onClick={() => handleError400(item.id)} className='text-danger fw-semibold fs-6 mt-2 cursor-pointer'>
                    400 :
                    <span className='ms-2'>{chartData[item.id]?.data.reduce((sum: number, d: UrlChartData) => sum + d.error400Count, 0) || 0}</span>
                  </div>
                </div>
              </div>
              <div className='col'>
                <div className='bg-light-danger px-6 py-8 rounded-2'>
                  <KTIcon iconName='abstract-26' className='fs-3x text-danger d-block my-2' />
                  <div onClick={() => handleError500(item.id)} className='text-danger fw-semibold fs-6 mt-2 cursor-pointer'>
                    500 :
                    <span className='ps-3'>{chartData[item.id]?.data.reduce((sum: number, d: UrlChartData) => sum + d.error500Count, 0) || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* end::Body */}
    </div >
  )
}

const chart1Options = (chartColor: string, chartHeight: string, data: { categories: string[]; series: { total_pages: number[]; rendered_pages: number[]; not_rendered_pages: number[] } }): ApexOptions => {
  const labelColor = getCSSVariableValue('--bs-gray-800')
  const strokeColor = getCSSVariableValue('--bs-gray-300')
  const baseColor = getCSSVariableValue('--bs-' + chartColor) as string
  const lightColor = getCSSVariableValue('--bs-' + chartColor + '-light')

  return {
    series: [
      //{name: 'Total Pages', data: data.series.total_pages || [0] },
      { name: 'Rendered Pages', data: data.series.rendered_pages || [0] },
      { name: 'Not Rendered Pages', data: data.series.not_rendered_pages || [0] },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'line',
      height: 150,
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

export { MixedWidget8 }
