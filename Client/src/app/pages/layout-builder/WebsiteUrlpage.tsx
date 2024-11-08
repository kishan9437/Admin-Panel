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
import { useLocation } from 'react-router-dom'

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
}

const WebsiteUrlpage: React.FC = () => {
    const [filterWebsite, setFilterWebsite] = useState<WebsiteUrl[]>([]);
    const [filteredResults, setFilteredResults] = useState<WebsiteUrl[]>([]);
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [urls, setUrls] = useState<Website[]>([]);
    const [currentWebsiteId, setCurrentWebsiteId] = useState<string | null>(null);
    const [selectedUrl, setSelectedUrl] = useState('')
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    // const param = useParams<{ id: string }>();
    // const id = param.id;
    const { id } = useParams<{ id: string }>();
    const [parent_url, setParent_url] = useState('')

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
                setUrls(data.data)
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

    const fetchWebsiteUrlById = async (websiteId: string, page: number = 1, itemsPerPage: number) => {
        try {
            if (auth && auth.api_token) {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/website-urls-id/${websiteId}?page=${page}&limit=${itemsPerPage}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                });
                const data = await response.json();
                console.log(data);
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
                                    fetchWebsiteUrlById(currentWebsiteId, currentPage, itemsPerPage);
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

    const handlePageClick = (selectedPage: { selected: number }) => {
        const selectedPageNumber = selectedPage.selected + 1;
        setCurrentPage(selectedPageNumber);

        if (currentWebsiteId) {
            fetchWebsiteUrlById(currentWebsiteId, selectedPageNumber, itemsPerPage);
        } else {
            console.log('Current website ID is not set.');
        }
    }

    const handleUrlClick = async (websiteId: string, url: string) => {
        setCurrentWebsiteId(websiteId)
        setCurrentPage(1);
        fetchWebsiteUrlById(websiteId, 1, itemsPerPage)
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
                item.parent_url.toLowerCase().includes(searchTerm)
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
            case 'Active':
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
            fetchWebsiteUrlById(currentWebsiteId, 1, newItemsPerPage);
        }
    };

    
    useEffect(() => {
        fetchUrl();
        if (id) {
            fetchWebsiteUrlById(id, currentPage, itemsPerPage);
        }
    }, [id, itemsPerPage, currentPage]);

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
                <div className="container" id='tableContainer'>
                    <div className='searchContainer'>
                        <div className='d-flex justify-content-start w-100 '>
                            <Dropdown id='urlsDropdown'>
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    Select Websites URL
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {urls.map((items, index) => (
                                        <Dropdown.Item key={index} onClick={() => handleUrlClick(items._id, items.url)}>
                                            {items.url}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            <div className='pt-0 ps-5'>
                                <div className="card shadow-sm shadow-sg rounded p-0 " style={{ maxWidth: '400px' }}>
                                    <div className="card-body pt-1 pb-0">
                                        <h6 className="card-title padding-top">Selected URL : {selectedUrl || "No URL Selected"}</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <span className='pt-1 pe-3 text-white fs-5 fw-bold'>Search : </span> */}

                        <div className="d-flex align-items-center mb-3 me-3 ">
                            <select name="" id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange} className='ps-1 rounded h-100'>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={handleSearch}
                            className="mb-3"
                        />
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <Table id='tableWebsiteUrl' striped bordered hover responsive="sm" className="table rounded overflow-hidden" style={{ minWidth: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Website Id</th>
                                    <th>URL Hash</th>
                                    <th>URL</th>
                                    <th>Last Render At</th>
                                    <th>Created At</th>
                                    <th>Depth</th>
                                    <th>Archived</th>
                                    <th>Header</th>
                                    <th>Parent URL</th>
                                    <th>Status Code</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Show skeletons while data is loading
                                    Array(5).fill(0).map((_, index) => (
                                        <tr key={index}>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td><Skeleton count={1} /></td>
                                            <td></td>
                                        </tr>
                                    ))
                                ) : filteredResults.length > 0 ? (
                                    // Map through filteredResults to display data
                                    filteredResults.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.website_id}</td>
                                            <td>{item.url_hash}</td>
                                            <td><a href={item.url} target='_blank' rel='noopener noreferrer'>{item.url}</a></td>
                                            <td>{new Date(item.last_render_at).toLocaleString()}</td>
                                            <td>{new Date(item.created_at).toLocaleString()}</td>
                                            <td>{item.depth}</td>
                                            <td>{item.is_archived ? 'Yes' : 'No'}</td>
                                            <td>
                                                {item.headers && Object.keys(item.headers).map((key) => (
                                                    <div key={key}>
                                                        <span>{key}:</span> {item.headers[key]}
                                                    </div>
                                                ))}
                                            </td>
                                            <td><a href={item.parent_url} target='_blank' rel='noopener noreferrer'>{item.parent_url}</a></td>
                                            <td>{item.status_code}</td>
                                            <td>
                                                <span className={`status-cell ${getStatusClass(item.status as 'Pending' | 'Complete' | 'Error' | 'Active' | 'Inactive')}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Dropdown id='tableDropdown'>
                                                    <Dropdown.Toggle variant="secondary" id="dropdown-basic" bsPrefix='custom-dropdown-toggle'>
                                                        <FontAwesomeIcon icon={faEllipsisH} className='fs-3 pt-1' />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className='custom-dropdown-menu'>
                                                        <Dropdown.Item as={Link} to={`/websiteurl/update-websiteUrl/${item._id}`}>
                                                            <FontAwesomeIcon icon={faEdit} className='fs-3 text-primary' />
                                                            <span className='fs-5 ps-2 fw-bold text-primary'>Edit</span>
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => handleDeleteItem(item._id)}>
                                                            <FontAwesomeIcon icon={faTrash} className='fs-3 text-danger' />
                                                            <span className='fs-5 ps-2 fw-bold text-danger'>Delete</span>
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => fetchWebsiteUrlById(item.website_id, 1, itemsPerPage)}>
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
                            pageCount={totalPages}  // Total pages from API
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
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
                </div>
            </Content>
        </>
    )
}

export { WebsiteUrlpage }
