
import React, { useEffect, useRef, useState } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { getCSSVariableValue } from '../../../assets/ts/_utils'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../app/modules/auth'

type Props = {
  className: string
  chartColor: string
  chartHeight: string
}

interface Urldata {
  _id: string;
  name: string;
  url: string;
  access_key: string;
  status: string;
}

const MixedWidget11: React.FC<Props> = ({ className, chartColor, chartHeight }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const { mode } = useThemeMode()
  const [chartData, setChartData] = useState({
    categories: [] as string[],
    series: {
      total_pages: [] as number[],
      rendered_pages: [] as number[],
      not_rendered_pages: [] as number[],
    },
  });
  const [currentUrl, setCurrentUrl] = useState('');
  const [totalItems, setTotalItems] = useState(0)
  const [error400Total, setError400Total] = useState(0)
  const [error500Total, setError500Total] = useState(0)
  const [renderedPages, setRenderedPages] = useState(0)
  const [notRenderedPages, setNotRenderedPages] = useState(0)
  const [error400Id, setError400Id] = useState<string | null>(null);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [urls, setUrls] = useState<Urldata[]>([]);
  const [selectedUrl, setSelectedUrl] = useState("")
  const [monthCount, setMonthCount] = useState("6")
  const [filterType, setFilterType] = useState<'daily' | 'today' | 'monthly' | 'weekly' | 'yearly'>('monthly');
  const [secondSelectOptions, setSecondSelectOptions] = useState<string[]>(['6 months', '12 months']); // Default for 'monthly'

  const fetchChartData = async (selectedParentUrl: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chart-data?parent_url=${selectedParentUrl}&filterType=${filterType}&monthCount=${monthCount}`);

      const data = await response.json();
      // console.log('API Response:', data.notRenderedPages);
      setError400Id(data.error400Data[0]._id)

      // console.log(data.);
      setError400Total(data.error400Total)
      setError500Total(data.error500Total)
      setCurrentUrl(data.parent_url)
      setTotalItems(data.totalItems)
      setRenderedPages(data.renderedPages)
      setNotRenderedPages(data.notRenderedPages)

      let categories: string[] = [];
      let series = {
        total_pages: [] as number[],
        rendered_pages: [] as number[],
        not_rendered_pages: [] as number[],
      };

      if (filterType === "today") {
        const detail = data[filterType];
        if (detail) {
          categories = [detail.date];
          series = {
            total_pages: [detail.total_pages],
            rendered_pages: [detail.rendered_pages],
            not_rendered_pages: [detail.not_rendered_pages],
          };
        }
      } else {
        const details = data[filterType]?.details || [];
        if (filterType === 'weekly') {
          categories = details.map(
            (item: { week_start: string; week_end: string }) =>
              `${new Date(item.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(item.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          );
        } else if (filterType === "monthly") {
          categories = details.map((item: { month: string }) => item.month);
        } else if (filterType === "yearly") {
          categories = details.map((item: { year: number }) => item.year.toString());
        } else {
          categories = details.map((item: { date: string }) =>
            new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // e.g., "Nov 23"
          );
        }

        // console.log("Chart Categories:", categories);
        series = {
          total_pages: details.map((item: { total_pages: number }) => item.total_pages),
          rendered_pages: details.map((item: { rendered_pages: number }) => item.rendered_pages),
          not_rendered_pages: details.map((item: { not_rendered_pages: number }) => item.not_rendered_pages),
        };
      }

      setChartData({
        categories,
        series,
      })
      // console.log("Chart Data:", categories)
    } catch (error) {
      console.error('Failed to fetch chart data', error)
    }
  }

  const updateSecondSelectOptions = () => {
    switch (filterType) {
      case 'daily':
        setSecondSelectOptions(['8 days', '16 days']);
        setMonthCount('8 day');
        break;
      case 'weekly':
        setSecondSelectOptions(['4 weeks', '8 weeks', '12 weeks']);
        setMonthCount('4 weeks');
        break;
      case 'monthly':
        setSecondSelectOptions(['6 months', '12 months']);
        setMonthCount('6 months');
        break;
      case 'yearly':
        setSecondSelectOptions(['4 years', '6 years']);
        setMonthCount('4 years');
        break;
      default:
        setSecondSelectOptions(['6', '12'])
    }
  }
  const fetchUrl = async () => {
    try {
      if (auth && auth.api_token) {
        const response = await fetch(`http://localhost:5000/api/website-url`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${auth.api_token}`
          }
        })
        const result = await response.json()
        //  console.log('urls data', result.data)

        if (result && result.success && result.data) {
          setUrls(result.data)
          setSelectedUrl(result.data[0]?.url || "")
        }
      }
      else {
        console.error('No valid auth token available');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch URL', error)
    }
  }

  useEffect(() => {
    fetchUrl();
    updateSecondSelectOptions();
  }, [filterType]);

  useEffect(() => {
    if (selectedUrl) {
      fetchChartData(selectedUrl);
    }
  }, [selectedUrl, filterType, monthCount])

  const refreshChart = () => {
    if (!chartRef.current) {
      return
    }

    const chart = new ApexCharts(chartRef.current, chartOptions(chartColor, chartHeight, chartData))
    if (chart) {
      chart.render()
    }

    return chart
  }

  useEffect(() => {
    const chart = refreshChart()

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, mode])

  return (
    <div className={`card ${className}`}>
      {/* begin::Body */}
      <div className='card-body p-0 d-flex justify-content-between flex-column overflow-hidden'>
        {/* begin::Hidden */}
        <div className='d-flex flex-stack flex-wrap flex-grow-1 px-6 pt-6 pb-3'>
        <div className="row w-100 align-items-center g-3 mt-0">
          {/* URL Dropdown */}
          <div className="col-12 col-md-4 mt-0 pe-0">
            <div className="card-title align-items-start flex-column me-0">
              <div className="card-label fw-bold fs-5 w-100 me-0">
                <select
                  value={selectedUrl}
                  className="form-select form-select-sm"
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setSelectedUrl(newUrl);
                    fetchChartData(newUrl);
                  }}
                >
                  {urls.map((url) => (
                    <option key={url._id} value={url.url}>
                      {url.url}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Month Count Dropdown */}
          <div className="col-6 col-md-4 mt-0">
            <div className="d-flex align-items-center">
              <select
                value={monthCount}
                className="form-select form-select-sm"
                onChange={(e) => setMonthCount(e.target.value)}
              >
                {secondSelectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Type Dropdown */}
          <div className="col-6 col-md-4 mt-0 pe-0 ps-0">
            <div className="card-toolbar">
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as 'daily' | 'today' | 'monthly' | 'weekly' | 'yearly')
                }
                className="form-select form-select-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>
        </div>
        {/* end::Hidden */}

        {/* begin::Chart */}
        <div ref={chartRef} className='mixed-widget-10-chart'></div>
        {/* end::Chart */}
      </div>
    </div>
  )
}

const chartOptions = (
  chartColor: string,
  chartHeight: string,
  data: { categories: string[]; series: { total_pages: number[]; rendered_pages: number[]; not_rendered_pages: number[] } }
): ApexOptions => {
  const labelColor = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')
  const secondaryColor = getCSSVariableValue('--bs-gray-300')
  const baseColor = getCSSVariableValue('--bs-' + chartColor)

  return {
    series: [
      { name: 'Total Pages', data: data.series.total_pages },
      { name: 'Rendered Pages', data: data.series.rendered_pages },
      { name: 'Not Rendered Pages', data: data.series.not_rendered_pages },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'bar',
      height: chartHeight,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 5,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
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
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    fill: {
      type: 'solid',
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
          return '$' + val + ' revenue'
        },
      },
    },
    colors: [baseColor, secondaryColor],
    grid: {
      padding: {
        top: 10,
      },
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  }
}

export { MixedWidget11 }
