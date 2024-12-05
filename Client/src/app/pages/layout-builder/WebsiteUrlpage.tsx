import React, { useState, useEffect, HtmlHTMLAttributes } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import { Content } from '../../../_metronic/layout/components/Content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faSync, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../modules/auth'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import Pagination from 'react-paginate'
import Dropdown from 'react-bootstrap/Dropdown'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useParams } from 'react-router-dom'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";


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

interface Website {
    url: string,
    _id: string,
    id: string;
}

const WebsiteUrlpage: React.FC = () => {
    const [filterWebsite, setFilterWebsite] = useState<WebsiteUrl[]>([]);
    const [filteredResults, setFilteredResults] = useState<WebsiteUrl[]>([]);
    const [search, setSearch] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [urls, setUrls] = useState<Website[]>([]);
    const [currentWebsiteId, setCurrentWebsiteId] = useState<string | null>(null);
    const [selectedUrl, setSelectedUrl] = useState('')
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();
    const [copied, setCopied] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortColumn, setSortColumn] = useState<string>('name'); // Default sort column
    const [status, setStatus] = useState<string>("");

    const fetchUrl = async () => {
        try {
            setLoading(true);
            if (auth && auth.api_token) {
                const response = await fetch(`http://localhost:5000/api/website-url`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                })
                const data = await response.json()
                if (data && data.data) {
                    setUrls(data.data);
                } else {
                    console.error("URLs not found in data");
                }
                setLoading(false);
            }
            else {
                console.error('No valid auth token available');
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchWebsiteUrlById = async (page: number = 1, order: 'asc' | 'desc' = 'asc', column: string = 'name', websiteId: string, itemsPerPage: number, search: string = '',selectedStatus: string) => {
        try {
            if (auth && auth.api_token) {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/website-urls-id/${websiteId}?page=${page}&limit=${itemsPerPage}&search=${search}&order=${order}&status=${selectedStatus}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                });
                const data = await response.json();

                if (Array.isArray(data.urls)) {
                    const matchedUrls = data.urls.filter((item: WebsiteUrl) => item.website_id === id);
                    setFilterWebsite(matchedUrls);
                    setFilteredResults(matchedUrls);
                    setTotalPages(data.totalPages || 1);
                } else {
                    console.error("Data format error: 'urls' is not an array.");
                }
                setFilterWebsite(data.urls);
                setFilteredResults(data.urls);
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
                        await response.json()

                        if (response.ok) {
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Success',
                                text: 'Data Deleting successfully',
                                confirmButtonText: "OK"
                            }).then(() => {
                                if (currentWebsiteId) {
                                    fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, currentWebsiteId, itemsPerPage, '',status);
                                }
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

    const handleSort = (column: string) => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        setSortColumn(column);

        if (currentWebsiteId) {
            fetchWebsiteUrlById(currentPage, newOrder, column, currentWebsiteId, itemsPerPage, '',status);
        } else {
            console.error('No website ID available for sorting.');
        }
    };

    const handlePageClick = (selectedPage: { selected: number }) => {
        const selectedPageNumber = selectedPage.selected + 1;
        setCurrentPage(selectedPageNumber);

        if (currentWebsiteId) {
            fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, currentWebsiteId, itemsPerPage, '',status);
        } else {
            console.log('Current website ID is not set.');
        }
    }

    const handleUrlClick = async (websiteId: string, url: string) => {
        setCurrentWebsiteId(websiteId)
        setCurrentPage(1);
        fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, websiteId, itemsPerPage, '',status)
        setSelectedUrl(url)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearch(searchTerm);

        if (searchTerm === '') {
            setFilteredResults(filterWebsite);
        } else {
            const results = filterWebsite.filter(item =>
                item.website_id.toLowerCase().includes(searchTerm) ||
                item.url.toLowerCase().includes(searchTerm) ||
                item.status.toLowerCase().includes(searchTerm) ||
                item.status_code.toString().includes(searchTerm) ||
                item.depth.toString().includes(searchTerm) ||
                item.parent_url.toLowerCase().includes(searchTerm) ||
                item.is_archived.toString().includes(searchTerm)
            );
            setFilteredResults(results);
        }
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
        const newItemsPerPage = Number(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        if (currentWebsiteId) {
            fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, currentWebsiteId, itemsPerPage, '',status);
        }
    };

    
    useEffect(() => {
        fetchUrl();
        if (id) {
            fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, id, itemsPerPage, '',status);
        }
        else if (currentWebsiteId) {
            fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, currentWebsiteId, itemsPerPage, '',status);
        }
        // console.log("param id: ",id);
    }, [id, currentPage, sortOrder, sortColumn, itemsPerPage,status]);
    
    // useEffect(() => {
    //     if (currentWebsiteId) {
    //         fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, currentWebsiteId, itemsPerPage, '',status);
    //     }
    // }, [currentWebsiteId, currentPage,sortOrder, sortColumn, itemsPerPage,status]);

    useEffect(() => {
        if (urls.length > 0 && id) {
            const url = urls.find((url) => url._id === id);
            if (url) {
                setSelectedUrl(url.url);
            }
        }
    }, [urls, id]);

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
    return (
        <>
            <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
                <div id="kt_toolbar_container" className="container d-flex flex-stack">
                    <div className="page-title d-flex flex-column">
                        <h1 className="d-flex text-white fw-bold my-1 fs-3">Website URL</h1>
                    </div>
                    <div className="d-flex align-items-center py-1">
                        <Link to='/websiteurl/add-WebsiteUrl' className="btn bg-body btn-active-color-primary" id="kt_toolbar_primary_button" data-bs-theme="light">New</Link>
                    </div>
                </div>
            </div>
            <Content>
                {/* Row Container */}
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6 col-lg-3 mt-0 mb-2">
                        <Dropdown id="urlsDropdown">
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="w-100">
                                Select Website URL
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {urls.map((items, index) => (
                                    <Dropdown.Item key={index} onClick={() => handleUrlClick(items._id, items.url)}>
                                        {items.url}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {/* Selected URL Card */}
                    <div className="col-12 col-md-6 col-lg-3 mt-0 mb-2">
                        <div className="card shadow-sm rounded pt-1" >
                            <div className="card-body pt-1 pb-0 ps-0 pe-0 text-center">
                                <div className="card-title">
                                    <span className='fw-bold'> URL: {selectedUrl || "No URL Selected"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-2 mt-0 mb-2">
                        <select
                            id="status-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)} 
                            className="form-select form-select-sm mt-0 "
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Rendered">Rendered</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="col-12 col-md-8 col-lg-4 mt-0 d-flex g-1 mb-2">
                        <div className='flex-shrink-0 me-2' style={{ width: '71px', marginLeft: '3px' }}>
                            <select
                                id="itemsPerPage"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="form-select form-select-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className='flex-grow-1 ms-1 me-1'>
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
                                {/* <th>Website Id</th> */}
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
                                <th onClick={() => handleSort('created')} className='cursor-pointer'>
                                    Created At
                                    <span className='ms-1'>
                                        {sortColumn === 'created' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('depth')} className='cursor-pointer'>
                                    Depth
                                    <span className='ms-1'>
                                        {sortColumn === 'depth' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('archived')} className='cursor-pointer'>
                                    Archived
                                    <span className='ms-1'>
                                        {sortColumn === 'archived' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                    </span>
                                </th>
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
                                        <td><Skeleton count={1} /></td>
                                        <td><Skeleton count={1} /></td>
                                        <td><Skeleton count={1} /></td>
                                        <td><Skeleton count={1} /></td>
                                        <td><Skeleton count={1} /></td>
                                        <td><Skeleton count={1} /></td>
                                        {/* <td><Skeleton count={1} /></td> */}
                                        {/* <td><Skeleton count={1} /></td> */}
                                        <td><Skeleton count={1} /></td>
                                        <td><Skeleton count={1} /></td>
                                        <td></td>
                                    </tr>
                                ))
                            ) : filteredResults.length > 0 ? (
                                filteredResults.map((item, index) => (
                                    <tr key={index}>
                                        {/* <td>{item.website_id}</td> */}
                                        <td>{item.url_hash}</td>
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
                                        <td>{new Date(item.created_at).toLocaleString()}</td>
                                        <td>{item.depth}</td>
                                        <td>{item.is_archived ? 'true' : 'false'}</td>
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
                                                    <Dropdown.Item onClick={() => fetchWebsiteUrlById(currentPage, sortOrder, sortColumn, item.website_id, itemsPerPage, '',status)}>
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

                </div>
                {filteredResults.length > 0 && (
                    <Pagination
                        previousLabel={'Previous'}
                        nextLabel={'Next'}
                        breakLabel={'...'}
                        pageCount={totalPages}
                        marginPagesDisplayed={1}
                        // pageRangeDisplayed={1}
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
