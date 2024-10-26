import React, { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import { Content } from '../../../_metronic/layout/components/Content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faChevronLeft, faSync, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../modules/auth'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import Pagination from 'react-paginate'
import Dropdown from 'react-bootstrap/Dropdown'
import { url } from 'inspector'
import { string } from 'yup'

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
    const [websiteUrls, setWebsiteUrls] = useState<WebsiteUrl[]>([]);
    const [search, setSearch] = useState('');
    const [filterWebsite, setFilterWebsite] = useState<WebsiteUrl[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [urls, setUrls] = useState<Website[]>([]);
    const itemsPerPage = 5;
    const { auth } = useAuth();

    const fetchUrl = async () => {
        try {
            if (auth && auth.api_token) {
                const response = await fetch(`http://localhost:5000/api/website-url`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                })
                const data = await response.json()
                // console.log(data.data)
                setUrls(data.data)
                // console.log(urls)
            }
            else {
                console.error('No valid auth token available');
                return;
            }

        } catch (error) {
            console.log(error);
        }
    }

    const fetchWebsiteUrlById = async (websiteId: string) => {
        try {
            if (auth && auth.api_token) {
                const response = await fetch(`http://localhost:5000/api/website-urls-id/${websiteId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                });
                const data = await response.json();
                console.log(data.urls);
                setFilterWebsite(data.urls);  // Filtered data ne set kariyu
            } else {
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error('Error fetching website URL by ID', error);
        }
    }

    const handleDeleteItem = async (id: string) => {
        try {
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
                        // fetchWebsiteUrlById();
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

        } catch (error) {
            console.log(error)
        }
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.trim().toLowerCase()
        setSearch(value);

        if (value === "") {
            setFilterWebsite(filterWebsite);
        }
        else {
            const searchTerm = value.split(' ');
            const filtered = filterWebsite.filter((user) => {
                return searchTerm.some((term) =>
                    user.url.toLowerCase().includes(term) ||
                    user.url_hash.toLowerCase().includes(term) ||
                    user.status_code.toString().toLowerCase().includes(term) ||
                    user.status.toLowerCase().includes(term) ||
                    user.depth.toString().toLowerCase().includes(term) ||
                    user.parent_url.toLowerCase().includes(term) ||
                    user.is_archived.toString().toLowerCase().includes(term)
                );
            });
            setFilterWebsite(filtered);
        }
    }

    const handlePageClick = (selectedPage: { selected: number }) => {
        const selectedPageNumber = selectedPage.selected + 1;  // Paginate starts at 0
        setCurrentPage(selectedPageNumber);
        // fetchWebsiteUrlById(selectedPageNumber);  // Fetch data for new page
    }


    const handleUrlClick = async (websiteId: string) => {
        fetchWebsiteUrlById(websiteId)
    }
    useEffect(() => {
        // fetchWebsiteUrlById();
        fetchUrl();
    }, [])
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
                                        <Dropdown.Item key={index} onClick={() => handleUrlClick(items._id)}>
                                            {items.url}
                                            {/* {items._id} */}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        {/* <span className='pt-1 pe-3 text-white fs-5 fw-bold'>Search : </span> */}
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={handleSearch}
                            className="mb-3"
                        />
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <Table id='tableWebsiteUrl' striped bordered hover responsive="sm" className="table" style={{ minWidth: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Website Id</th>
                                    <th>URL Hash</th>
                                    <th>URL</th>
                                    <th>Last Render At</th>
                                    <th>Status Code</th>
                                    <th>Created At</th>
                                    <th>Depth</th>
                                    <th>Archived</th>
                                    <th>Header</th>
                                    <th>Parent URL</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterWebsite.length > 0 ? (
                                    filterWebsite.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.website_id}</td>
                                            <td>{item.url_hash}</td>
                                            <td><a href={item.url} target='_blank'>{item.url}</a></td>
                                            <td>{new Date(item.last_render_at).toLocaleString()}</td>
                                            <td>{item.status_code}</td>
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
                                            <td><a href={item.parent_url} target='_blank'>{item.parent_url}</a></td>
                                            <td>{item.status}</td>
                                            <td>
                                                <div>

                                                </div>
                                                <Dropdown id='tableDropdown'>
                                                    <Dropdown.Toggle variant="secondary" id="dropdown-basic" bsPrefix='custom-dropdown-toggle'>
                                                        <FontAwesomeIcon icon={faEllipsisH} className='fs-3 pt-1' />
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu className='custom-dropdown-menu'>
                                                        <Dropdown.Item as={Link} to={`/websiteurl/update-websiteUrl/${item._id}`}>
                                                            <FontAwesomeIcon icon={faEdit} className='fs-4 ps-2 text-primary' />
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => handleDeleteItem(item._id)}>
                                                            <FontAwesomeIcon icon={faTrash} className='fs-4 ps-2 text-danger' />
                                                        </Dropdown.Item>
                                                        <Dropdown.Item>
                                                            <FontAwesomeIcon icon={faSync} className='fs-4 ps-2 text-info' />
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                            {/* <td>
                                                <div className='d-flex'>
                                                    <Link to={`/websiteurl/update-websiteUrl/${item._id}`}>
                                                        <button className='actionIcons editBackground'>
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => handleDeleteItem(item._id)} className='actionIcons deleteBackground'>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={12} className='text-center'>Data Not Found</td>
                                    </tr>
                                )}

                            </tbody>
                        </Table>

                    </div>
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
                </div>
            </Content>
        </>
    )
}

export { WebsiteUrlpage }
