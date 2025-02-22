import React, { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import { Content } from '../../../_metronic/layout/components/Content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faSync, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { useAuth, useDateRange } from '../../modules/auth'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import Pagination from 'react-paginate'
import Dropdown from 'react-bootstrap/Dropdown'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FaGreaterThan } from "react-icons/fa";
import { UrlChart } from '../../../_metronic/partials/widgets/mixed/UrlChart'
import ActivityModal from './Component/ActivityModal'
import axios from 'axios';

interface WebsiteUrl {
    _id: string,
    website_id: string;
    url_hash: string;
    url: string;
    headers: Record<string, string>;
    last_render_at: Date;
    created_at: Date;
    status: string;
    status_code: number;
    depth: number;
    parent_url: string;
    is_archived: boolean;
}

interface WebsiteUrlInput {
    website_id: string;
    url_hash: string;
    url: string;
    headers: Record<string, string>;
    last_render_at: string;
    status: string;
    status_code: number;
    depth: number;
    parent_url: string;
    is_archived: boolean;
}

const WebsiteUrlpage: React.FC = () => {
    const [filteredResults, setFilteredResults] = useState<WebsiteUrl[]>([]);
    const [search, setSearch] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const websiteId = location.state?.id;
    const navigate = useNavigate();
    const { name, previousPath, url } = location.state || {};
    const [copied, setCopied] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortColumn, setSortColumn] = useState<string>('name');
    const [status, setStatus] = useState<string>("");
    const [page, setPage] = useState<number>();
    const [formData, setFormData] = useState<WebsiteUrlInput>({
        website_id: '',
        url_hash: '',
        url: '',
        headers: {},
        last_render_at: '',
        status: 'Pending',
        status_code: 0,
        depth: 0,
        parent_url: '',
        is_archived: false
    });
    const { startDate, endDate } = useDateRange()
    const formattedStartDate = startDate ? new Date(startDate).toISOString() : undefined;
    const formattedEndDate = endDate ? new Date(endDate).toISOString() : undefined;
    const [showModal, setShowModal] = useState(false);
    const [timelineData, setTimelineData] = useState<
        Array<{
            url: string;
            status: string;
            last_render_at: string | null;
            pending: string | null;
            errors: Array<{
                statusCode: number;
                errorType: string;
            }>;
        }>
    >([]);
    const [selectedUrl, setSelectedUrl] = useState<string>('');

    // console.log(url)
    const fetchWebsiteUrlById = async (
        page: number = currentPage,
        order: 'asc' | 'desc' = 'asc',
        column: string = 'name',
        search: string = '',
        selectedStatus: string,
        websiteId?: string,
        itemsLimit: number = itemsPerPage,
        startDate?: string,
        endDate?: string
    ) => {
        try {
            if (auth && auth.api_token) {
                setLoading(true);

                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: itemsLimit.toString(),
                    order,
                    search,
                    status: selectedStatus || '',
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                }).toString();

                const url = websiteId
                    ? `http://localhost:5000/api/website-urls-id/${websiteId}?${queryParams}`
                    : '';

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                });
                const data = await response.json();
                // console.log(data);
                setFilteredResults(data.data);
                setTotalPages(data.totalPages);
                setLoading(false);
            } else {
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error('Error fetching website URL by ID', error);
            setLoading(false);
        }
    }

    const handleDeleteItem = async (id: string) => {
        try {
            Swal.fire({
                title: 'Are you sure?',
                text: "Do you want to delete this data?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    if (auth && auth.api_token) {
                        const response = await fetch(`http://localhost:5000/api/delete-website-url/${id}`, {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${auth.api_token}`
                            }
                        })
                        await response.json();

                        if (response.ok) {
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Success',
                                text: 'Data Deleting successfully',
                                confirmButtonText: "OK"
                            }).then(() => {
                                fetchWebsiteUrlById(page, sortOrder, sortColumn, search, status, websiteId, itemsPerPage, formattedStartDate, formattedEndDate);
                            })
                        }
                        else {
                            Swal.fire({
                                position: 'center',
                                title: 'Error!',
                                text: 'Error deleting data. Please try again',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                    else {
                        console.error('No valid auth token available');
                        return;
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (auth && auth.api_token) {
                const response = await fetch('http://localhost:5000/api/add-website-url', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Success',
                        text: 'Data Added successfully',
                        confirmButtonText: "OK"
                    }).then(() => {
                        setFormData({
                            website_id: '',
                            url_hash: '',
                            url: '',
                            headers: {},
                            last_render_at: '',
                            status: 'Pending',
                            status_code: 0,
                            depth: 0,
                            parent_url: '',
                            is_archived: false
                        });
                        fetchWebsiteUrlById(page, sortOrder, sortColumn, search, status, websiteId);
                    });
                } else {
                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to add data',
                        confirmButtonText: "OK"
                    });
                }
            } else {
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSort = (column: string) => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        setSortColumn(column);
        fetchWebsiteUrlById(currentPage, newOrder, column, search, status);
    };

    const handlePageClick = (selectedItem: { selected: number }) => {
        const selectedPage = selectedItem.selected + 1;
        setPage(selectedPage);

        fetchWebsiteUrlById(selectedPage, sortOrder, sortColumn, search, status, websiteId, itemsPerPage, formattedStartDate, formattedEndDate);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value
        setSearch(searchValue)
    }

    const getStatusClass = (status: string): string => {
        switch (status) {
            case 'Complete':
                return 'status-complete';
            case 'Error':
                return 'status-error';
            case 'Rendered':
                return 'status-active';
            case 'Inactive':
                return 'status-inactive';
            case 'Pending':
                return 'status-pending';
            default:
                return 'status-unknown';
        }
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);

        fetchWebsiteUrlById(1, sortOrder, sortColumn, search, status, websiteId, newItemsPerPage, formattedStartDate, formattedEndDate);
    };

    const previousUrl = () => {
        navigate(`/websites`, { state: { websiteId, url, previousPath, name } })
    }

    useEffect(() => {
        if (websiteId) {
            fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, search, status, websiteId, itemsPerPage, formattedStartDate, formattedEndDate);
        }
    }, [websiteId, currentPage, sortOrder, sortColumn, search, status, formattedStartDate, formattedEndDate]);


    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 2000);
        });
    }

    const renderTooltip = (props: React.ComponentProps<typeof Tooltip>) => {
        return (
            <Tooltip id="tooltip" {...props}>
                {copied ? 'Copied!' : 'Click to Copy'}
            </Tooltip>
        )
    }

    const handleCloseModal = () => setShowModal(false);

    const handleOpenModal = (url: string) => {
        console.log(url)
        setSelectedUrl(websiteId);
        // setLoading(true);

        axios
            .get(
                `http://localhost:5000/api/url-activity?website_id=${websiteId}&startdate=${startDate}&enddate=${endDate}&url=${url}`
            )
            .then((response) => {
                console.log(response);
                setTimelineData(response.data);
                setLoading(false);
                setShowModal(true);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    return (
        <>
            <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
                <div id="kt_toolbar_container" className="container d-flex flex-stack">
                    <div className="d-flex flex-column">
                        <div className="d-flex align-items-center">
                            <div
                                className="d-flex align-item-center fw-semibold text-black py-2"
                            >
                                {
                                    previousPath && (
                                        <div onClick={previousUrl}
                                            className='breadcrumb fs-5 text-white cursor-pointer'
                                        >
                                            {previousPath
                                                .replace("/url", "")
                                                .replace("/", "")
                                                .replace(/-/g, " ")
                                                .charAt(0).toUpperCase() +
                                                previousPath
                                                    .replace("/url", "")
                                                    .replace("/", "")
                                                    .replace(/-/g, " ")
                                                    .slice(1).toLowerCase()
                                                || "Home"}
                                        </div>
                                    )
                                }
                                {previousPath && <span className="fs-8 text-white pt-1 mx-1 align-bottom">
                                    <svg
                                        aria-hidden="true"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="white"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M6.293 12.707a1 1 0 0 1 0-1.414L9.586 8 6.293 4.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
                                            shapeRendering="geometricPrecision"
                                        />
                                    </svg></span>}
                                {
                                    previousPath && (
                                        <div
                                            className='fs-5 disabled text-dark-light'
                                        >
                                            {previousPath.replace("/websites/url", "").replace("/", "") || ""}
                                        </div>
                                    )
                                }
                                {/* {
                                    previousPath && <span className="fs-8 text-white pt-1 mx-1 align-bottom">
                                        <svg
                                            aria-hidden="true"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="white"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M6.293 12.707a1 1 0 0 1 0-1.414L9.586 8 6.293 4.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
                                                shapeRendering="geometricPrecision"
                                            />
                                        </svg></span>
                                } */}
                                <span className="fs-6 text-white align-center" style={{ paddingTop: '2px' }}>{url}</span>
                            </div>
                        </div>
                        <div className=''>
                            <span className="my-1 fs-3 fw-bold text-white fw-bold">{name}</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center py-1">
                        <button
                            className="btn bg-body btn-active-color-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#websiteUrlModal"
                        >
                            New
                        </button>
                    </div>
                    {/* Modal Structure */}
                    <div
                        className="modal fade"
                        id="websiteUrlModal"
                        tabIndex={-1}
                        aria-labelledby="websiteUrlModalLabel"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="card p-5 shadow-lg border-0 rounded-3" style={{ maxWidth: '550px', width: '100%' }}>
                                    <h2 className="text-center fw-bold mb-4">Enter Websites Data</h2>
                                    {/* Form inside Modal */}
                                    <form className='form' onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold mb-1" htmlFor="name">Website ID:</label>
                                            <input
                                                type="text"
                                                className="form-control bg-transparent"
                                                name="website_id"
                                                placeholder="Enter Website ID"
                                                value={websiteId}
                                                onChange={handleChange}
                                                required
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label className="form-label fw-bold mb-1" htmlFor="url">URL:</label>
                                            <input
                                                type="text"
                                                className="form-control bg-transparent"
                                                name="url"
                                                placeholder="Enter URL"
                                                value={formData.url}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* <div className="mb-5">
                                            <label className="form-label fw-bold mb-1" htmlFor="url">Last Render At:</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control bg-transparent"
                                                name="last_render_at"
                                                value={formData.last_render_at}
                                                onChange={(e) => setFormData({ ...formData, last_render_at: e.target.value })}
                                            />
                                        </div> */}

                                        {/* <div className="mb-5">
                                            <label className="form-label fw-bold mb-1" htmlFor="status_code">Status Code:</label>
                                            <input
                                                type="number"
                                                className="form-control bg-transparent"
                                                name="status_code"
                                                placeholder="Enter Status Code"
                                                value={formData.status_code}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div> */}

                                        {/* <div className="mb-5">
                                            <label className="form-label fw-bold mb-1" htmlFor="depth">Depth:</label>
                                            <input
                                                type="number"
                                                className="form-control bg-transparent"
                                                name="depth"
                                                placeholder="Enter Depth"
                                                value={formData.depth}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div> */}

                                        {/* <div className="mb-5">
                                            <label className="form-label fw-bold mb-1" htmlFor="is_archived">Is Archived:</label>
                                            <input
                                                type="checkbox"
                                                className="form-check-input ms-3"
                                                name="is_archived"
                                                checked={formData.is_archived}
                                                onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })}
                                            />
                                        </div> */}

                                        <div className="d-grid">
                                            <button type="submit" data-bs-dismiss="modal" className="btn btn-primary" >Submit</button>
                                            <button
                                                type="button"
                                                className="btn btn-lg btn-light-primary w-100 mb-0 mt-3"
                                                data-bs-dismiss="modal"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Content>
                <UrlChart
                    className='card-xxl-stretch mb-xl-3'
                    chartColor='success'
                    chartHeight='150px'
                />
                {/* Row Container */}
                <div className="row g-3 align-items-center justify-content-end mt-5">
                    <div className="col-12 col-md-7 col-lg-2 mt-0 mb-2">
                        <select
                            id="status-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-select form-select-sm mt-0 shadow-sm "
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Rendered">Rendered</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="col-12 col-md-7 col-lg-3 mt-0 d-flex g-1 mb-2 ">
                        <div className='flex-shrink-0 me-2' style={{ width: '71px', marginLeft: '3px' }}>
                            <select
                                id="itemsPerPage"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="form-select form-select-sm shadow-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className='flex-grow-1 ms-1 me-1 shadow-sm'>
                            <Form.Control
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={handleSearch}
                                className="form-control form-control-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className='overflow-x-auto shadow-sm mb-4 rounded'>
                    <Table id='tableWebsiteUrl' striped bordered hover responsive="sm" className="table rounded" style={{ minWidth: '100%' }}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('urlhash')} className='cursor-pointer'>
                                    URL Hash
                                    <span className='ms-1'>
                                        {sortColumn === 'urlhash' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('url')} className='cursor-pointer'>
                                    URL
                                    <span className='ms-1'>
                                        {sortColumn === 'url' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('lastrender')} className='cursor-pointer'>
                                    Last Render
                                    <span className='ms-1'>
                                        {sortColumn === 'lastrender' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                {/* <th onClick={() => handleSort('created')} className='cursor-pointer'>
                                    Created At
                                    <span className='ms-1'>
                                        {sortColumn === 'created' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th> */}
                                <th onClick={() => handleSort('depth')} className='cursor-pointer'>
                                    Depth
                                    <span className='ms-1'>
                                        {sortColumn === 'depth' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                {/* <th onClick={() => handleSort('archived')} className='cursor-pointer'>
                                    Archived
                                    <span className='ms-1'>
                                        {sortColumn === 'archived' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th> */}
                                {/* <th>Header</th> */}
                                {/* <th>Parent URL</th> */}
                                <th onClick={() => handleSort('statuscode')} className='cursor-pointer'>
                                    Status Code
                                    <span className='ms-1'>
                                        {sortColumn === 'statuscode' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('status')} className='cursor-pointer'>
                                    Status
                                    <span className='ms-1'>
                                        {sortColumn === 'status' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Show skeletons while data is loading
                                Array(5).fill(0).map((_, index) => (
                                    <tr key={index}>
                                        {/* <td><Skeleton count={1} /></td> */}
                                        <td><Skeleton count={1} width={90} /></td>
                                        <td><Skeleton count={1} width={200} /></td>
                                        <td><Skeleton count={1} width={150} /></td>
                                        {/* <td><Skeleton count={1} width={150} /></td> */}
                                        <td><Skeleton count={1} width={30} /></td>
                                        {/* <td><Skeleton count={1} width={50} /></td> */}
                                        {/* <td><Skeleton count={1} /></td> */}
                                        {/* <td><Skeleton count={1} /></td> */}
                                        <td><Skeleton count={1} width={50} /></td>
                                        <td><Skeleton count={1} width={70} /></td>
                                        <td></td>
                                    </tr>
                                ))
                            ) : filteredResults.length > 0 ? (
                                filteredResults.map((item, index) => (
                                    <tr key={index}>
                                        {/* <td>{item.website_id}</td> */}
                                        <td>
                                            <span
                                                style={{ cursor: 'pointer', color: 'blue' }}
                                                onClick={() => handleOpenModal(item.url)}
                                            >
                                                {item.url_hash}
                                            </span>
                                        </td>
                                        <td>
                                            <OverlayTrigger
                                                placement="bottom"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={(props) => renderTooltip(props)}
                                            >
                                                <a
                                                    href={item.url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleCopy(item.url);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {item.url}
                                                </a>
                                            </OverlayTrigger>
                                        </td>
                                        <td>{new Date(item.last_render_at).toLocaleString()}</td>
                                        {/* <td>{new Date(item.created_at).toLocaleString()}</td> */}
                                        <td>{item.depth}</td>
                                        {/* <td>{item.is_archived ? 'true' : 'false'}</td> */}
                                        {/* <td>
                                                {item.headers && Object.keys(item.headers).map((key) => (
                                                    <div key={key}>
                                                        <span>{key}:</span> {item.headers[key]}
                                                    </div>
                                                ))}
                                            </td> */}
                                        {/* <td><a href={item.parent_url} target='_blank' rel='noopener noreferrer'>{item.parent_url}</a></td> */}
                                        <td>{item.status_code}</td>
                                        <td>
                                            <span className={`status-cell ${getStatusClass(item.status as 'Pending' | 'Complete' | 'Error' | 'Active' | 'Inactive' | 'Rendered')}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Dropdown id='tableDropdown'>
                                                <Dropdown.Toggle variant="secondary" id="dropdown-basic" bsPrefix='custom-dropdown-toggle'>
                                                    <FontAwesomeIcon icon={faEllipsisH} className='fs-3 pt-1' />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className='custom-dropdown-menu'>
                                                    {/* <Dropdown.Item as={Link} to={`/websiteurl/update-websiteUrl/${item._id}`}>
                                                            <FontAwesomeIcon icon={faEdit} className='fs-3 text-primary' />
                                                            <span className='fs-5 ps-2 fw-bold text-primary'>Edit</span>
                                                        </Dropdown.Item> */}
                                                    <Dropdown.Item onClick={() => handleDeleteItem(item._id)}>
                                                        <FontAwesomeIcon icon={faTrash} className='fs-3 text-danger' />
                                                        <span className='fs-5 ps-2 fw-bold text-danger'>Delete</span>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, search, status)}>
                                                        <FontAwesomeIcon icon={faSync} className='fs-3 text-info' />
                                                        <span className='fs-5 ps-2 fw-bold text-info'>Refresh</span>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className='text-center'>Data Not Found</td>
                                </tr>
                            )
                            }
                        </tbody>
                    </Table>
                    <ActivityModal
                        show={showModal}
                        onClose={handleCloseModal}
                        timelineData={timelineData}
                        loading={loading}
                    />
                </div>
                {filteredResults.length > 0 && (
                    <Pagination
                        previousLabel={'Previous'}
                        nextLabel={'Next'}
                        breakLabel={'...'}
                        pageCount={totalPages}
                        marginPagesDisplayed={1}
                        onPageChange={handlePageClick}
                        containerClassName={'pagination justify-content-right'}
                        pageClassName={'page-item'}
                        pageLinkClassName={'page-link'}
                        previousClassName={'page-item'}
                        previousLinkClassName={'page-link'}
                        nextClassName={'page-item'}
                        nextLinkClassName={'page-link'}
                        breakClassName={'page-item'}
                        breakLinkClassName={'page-link'}
                        activeClassName={'active'}
                    />
                )}
            </Content>
        </>
    )
}

export { WebsiteUrlpage }
