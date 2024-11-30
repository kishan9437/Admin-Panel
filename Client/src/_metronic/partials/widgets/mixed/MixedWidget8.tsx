import { useEffect, useRef, FC, useState } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import { getCSSVariableValue } from '../../../assets/ts/_utils'
import { Dropdown1 } from '../../content/dropdown/Dropdown1'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../app/modules/auth'

type Props = {
  className: string
  chartColor: string
  chartHeight: string
}

type ChartDetail = {
  date: string;
  total_pages: number;
  rendered_pages: number;
  not_rendered_pages: number;
  month: string;
};

interface Urldata {
  _id: string;
  name: string;
  url: string;
  access_key: string;
  status: string;
}
const MixedWidget8: FC<Props> = ({ className, chartColor, chartHeight }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const { mode } = useThemeMode()
  const [chartData, setChartData] = useState({
    categories: [] as string[],
    series: {
      total_pages: [] as number[],
      rendered_pages: [] as number[],
      not_rendered_pages: [] as number[],
    }
  })

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
    } catch (error) {
      console.error('Failed to fetch chart data', error)
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
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      fetchChartData(selectedUrl);
    }
  }, [selectedUrl, filterType, monthCount])

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

  const handleError400 = () => {
    if (error400Id) {
      navigate(`/400Error?id=${error400Id}`)
    }
  }

  const handleError500 = () => {
    if (error400Id) {
      navigate(`/500Error?id=${error400Id}`)
    }
  }

  const handleRender = () =>{
    if (error400Id){
      navigate(`/websiteurl/${error400Id}`)
    }
  }

  const handleNotRender = () => {
    if (error400Id){
      navigate(`/websiteurl/${error400Id}`)
    }
  }
  return (
    <div className={`card ${className}`}>
      {/* begin::Beader */}
      <div className='card-header border-0 py-5 position-relative'>
        <h5 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-5 mb-1'>
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
          </span>

          <span className='text-muted fw-semibold fs-7'></span>
        </h5>

        <div className='d-flex align-items-center ms-420 position-absolute'>
          <select name="" id="" className="form-select form-select-sm" onChange={(e) => setMonthCount(e.target.value)}>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
          </select>
        </div>
        <div className='card-toolbar '>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'daily' | 'today' | 'monthly' | 'weekly' | 'yearly')}
            className="form-select form-select-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

        </div>
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body d-flex flex-column'>
        {/* begin::Chart */}
        <div ref={chartRef} className='mixed-widget-5-chart card-rounded-top'></div>
        {/* end::Chart */}

        {/* begin::Items */}
        <div className='mt-5'>
          {/* begin::Item */}
          <div className='d-flex flex-stack mb-1 mt-5'>
            {/* begin::Section */}
            <div className='d-flex align-items-center me-2'>
              {/* begin::Symbol */}
              {/* <div className='symbol symbol-50px me-3'>
                <div className='symbol-label bg-light'>
                  <img
                    src={toAbsoluteUrl('media/svg/brand-logos/plurk.svg')}
                    alt=''
                    className='h-50'
                  />
                </div>
              </div> */}
              {/* end::Symbol */}

              {/* begin::Title */}
              {/* <div className='d-flex align-items-center'>
                <span className='fs-6 text-gray-800 fw-bold me-2 '>
                  Total Urls :
                </span>
                <div className='badge fw-semibold py-4 fs-6'>
                  <span>{totalItems}</span>
                </div>
              </div> */}
              {/* end::Title */}
            </div>
            {/* end::Section */}
          </div>
          {/* end::Item */}

          {/* begin::Item */}
          {/* <div className='d-flex flex-stack mb-1'>
            <div className='d-flex align-items-center me-2'>
              <div className='d-flex align-items-center '>
                <div onClick={handleError400} className='fs-6 text-gray-800 text-hover-primary fw-bold cursor-pointer'>
                  Error 400 Total :
                  <span className='ps-3'>{error400Total}</span>
                </div>
              </div>
            </div>
          </div> */}
          {/* end::Item */}

          {/* begin::Item */}
          {/* <div className='d-flex flex-stack'>
            <div className='d-flex align-items-center me-2 mt-2'>
              <div className='py-1'>
                <div onClick={handleError500} className='fs-6 text-gray-800 text-hover-primary fw-bold cursor-pointer'>
                  Error 500 Total :
                  <span className='ps-3'>{error500Total}</span>
                </div>
              </div>
            </div>
          </div> */}
          {/* end::Item */}
        </div>
        {/* end::Items */}
        <div className='row g-0'>
          <div className='col bg-light-warning px-6 py-8 rounded-2 me-7 mb-7'>
            <KTIcon iconName='chart-simple' className='fs-3x text-warning d-block my-2' />
            <div className='text-warning fw-semibold fs-6'>
              Total Urls :
              <span className='ms-2'>{totalItems}</span>
            </div>
          </div>
          <div className='col bg-light-success px-6 py-8 rounded-2 me-7 mb-7'>
            <KTIcon iconName='sms' className='fs-3x text-success d-block my-2' />
            <div onClick={handleRender} className='text-success fw-semibold fs-6 mt-2 cursor-pointer'>
              Rendered :
              <span className='ms-2'>{renderedPages}</span>
            </div>
          </div>

          <div className='col bg-light-success px-6 py-8 rounded-2 me-7 mb-7'>
            <KTIcon iconName='sms' className='fs-3x text-success d-block my-2 ' />
            <div onClick={handleNotRender} className='text-success fw-semibold fs-6 mt-2 cursor-pointer'>
              Not Rendered : 
              <span className='ms-2'>{notRenderedPages}</span>
            </div>
          </div>

          <div className='col bg-light-danger px-6 py-8 rounded-2 me-7 mb-7'>
            <KTIcon iconName='abstract-26' className='fs-3x text-danger d-block my-2' />
            <div onClick={handleError400} className='text-danger fw-semibold fs-6 mt-2 cursor-pointer'>
              Error 400 :
              <span className='ms-2'>{error400Total}</span>
            </div>
          </div>
          <div className='col bg-light-danger px-6 py-8 rounded-2  mb-7'>
            <KTIcon iconName='abstract-26' className='fs-3x text-danger d-block my-2' />
            <div onClick={handleError500} className='text-danger fw-semibold fs-6 mt-2 cursor-pointer'>
              Error 500 :
              <span className='ps-3'>{error500Total}</span>
            </div>
          </div>
        </div>
      </div>
      {/* end::Body */}
    </div>
  )
}

const chart1Options = (chartColor: string, chartHeight: string, data: { categories: string[]; series: { total_pages: number[]; rendered_pages: number[]; not_rendered_pages: number[] } }): ApexOptions => {
  const labelColor = getCSSVariableValue('--bs-gray-800')
  const strokeColor = getCSSVariableValue('--bs-gray-300')
  const baseColor = getCSSVariableValue('--bs-' + chartColor) as string
  const lightColor = getCSSVariableValue('--bs-' + chartColor + '-light')

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
      // max: Math.max(...chartData.data) + 10 || 100,
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
