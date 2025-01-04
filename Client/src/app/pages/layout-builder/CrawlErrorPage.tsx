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
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";


interface crawlError {
    website_id: string;
    url: string;
    source_url: number;
    error_message: string;
    error_type: string;
    created_at: string;
    _id: string;
}

const CrawlErrorPage: React.FC = () => {
    const { auth } = useAuth();
    const [crawlError, setCrawlError] = useState<crawlError[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filterCrawlError, setFilterCrawlError] = useState<crawlError[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState<number>()
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortColumn, setSortColumn] = useState<string>(''); // Default sort column
    const [error, setError] = useState<string>('');

    const getCrawlError = async (page: number = currentPage, order: 'asc' | 'desc' = 'asc', column: string = 'name', search: string = '', selectedError: string) => {
        try {
            if (auth && auth.api_token) {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/get-crawlError?page=${page}&limit=${itemsPerPage}&search=${search}&order=${order}&error=${selectedError}`, {
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                    },
                });
                const data = await response.json();
                // console.log('Fetched activities:', data);
                setCrawlError(data.items);
                setFilterCrawlError(data.items);
                setTotalPages(data.totalPages)

                setLoading(false);
            } else {
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error('Error fetching websites:', error);
        }
    }

    const handleSort = (column: string) => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        setSortColumn(column)
        getCrawlError(currentPage, newOrder, column, search, error);
    }

    const handlePageClick = (selectedItem: { selected: number }) => {
        const selectedPage = selectedItem.selected + 1;
        setPage(selectedPage);
        getCrawlError(selectedPage, sortOrder, sortColumn, search, error);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value
        setSearch(searchValue)
        getCrawlError(page, sortOrder, sortColumn, searchValue, error)
    }

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

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
                        const response = await fetch(`http://localhost:5000/api/crawlError/delete/${id}`, {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${auth.api_token}`
                            }
                        })
                        await response.json()

                        if (response.ok) {
                            // alert(response.message)
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Success',
                                text: 'Data Deleting successfully',
                                confirmButtonText: "OK"
                            }).then(() => {
                                getCrawlError(page, sortOrder, sortColumn, search, error);
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

    useEffect(() => {
        getCrawlError(currentPage, sortOrder, sortColumn, search, error);
    }, [itemsPerPage, currentPage, search, error])
    return (
        <>
            <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
                <div id="kt_toolbar_container" className="container d-flex flex-stack">
                    <div className="page-title d-flex flex-column">
                        <h1 className="d-flex text-white fw-bold my-1 fs-3">CrawlError</h1>
                    </div>
                    {/* <div className="d-flex align-items-center py-1">
                        <Link to='' className="btn bg-body btn-active-color-primary" id="kt_toolbar_primary_button" data-bs-theme="light">New</Link>
                    </div> */}
                </div>
            </div>
            <Content>
                <div className="container" id='tableContainer'>
                    <div className='searchContainer'>
                        <div className="d-flex align-items-center mb-3 me-3 ">
                            <select id="status-select"
                                value={error}
                                onChange={(e) => setError(e.target.value)}
                                className='rounded h-100 me-3 form-select form-select-sm'
                            >
                                <option value="">All</option>
                                <option value="rendering">Rendering</option>
                                <option value="validation">Validation</option>
                                <option value="other">Other</option>
                            </select>

                            <select name="itemsPerPage" id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange} className='ps-1 rounded h-100'>
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
                    <div className='table-responsive shadow-sm mb-4 rounded'>
                        <Table striped bordered hover responsive="sm" className="table ">
                            <thead>
                                <tr>
                                    {/* <th>website Id</th> */}
                                    <th onClick={() => handleSort('url')} className='cursor-pointer'>
                                        url
                                        <span className='ms-1'>
                                            {sortColumn === 'url' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('Sourceurl')} className='cursor-pointer'>
                                        Source Url
                                        <span className='ms-1'>
                                            {sortColumn === 'Sourceurl' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('Errormsg')} className='cursor-pointer'>
                                        Error Message
                                        <span className='ms-1'>
                                            {sortColumn === 'Errormsg' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('Errortype')} className='cursor-pointer'>
                                        Error Type
                                        <span className='ms-1'>
                                            {sortColumn === 'Errortype' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('Createdat')} className='cursor-pointer'>
                                        Created At
                                        <span className='ms-1'>
                                            {sortColumn === 'Createdat' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    loading ? (
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index}>
                                                {/* <td><Skeleton count={1} width={180} /></td> */}
                                                <td><Skeleton count={1} width={175} /></td>
                                                <td><Skeleton count={1} width={175} /></td>
                                                <td><Skeleton count={1} width={140} /></td>
                                                <td><Skeleton count={1} width={100} /></td>
                                                <td><Skeleton count={1} width={200} /></td>
                                                <td></td>
                                            </tr>
                                        ))
                                    ) :
                                        filterCrawlError.length > 0 ? (
                                            filterCrawlError.map((item, index) => (
                                                <tr key={index} className='h-50'>
                                                    {/* <td>{item.website_id}</td> */}
                                                    <td>{item.url}</td>
                                                    <td>{item.source_url}</td>
                                                    <td>{item.error_message}</td>
                                                    <td>{item.error_type}</td>
                                                    <td>{new Date(item.created_at).toLocaleString()}</td>
                                                    <td>
                                                        <Dropdown id='tableDropdown'>
                                                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" bsPrefix='custom-dropdown-toggle w-auto'>
                                                                <FontAwesomeIcon icon={faEllipsisH} className='fs-3 pt-1' />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu className='custom-dropdown-menu'>
                                                                {/* <Dropdown.Item  >
                                                                    <FontAwesomeIcon icon={faEdit} className='fs-3 text-primary' />
                                                                    <span className='fs-5 ps-2 fw-bold text-primary'>Edit</span>
                                                                </Dropdown.Item> */}
                                                                <Dropdown.Item onClick={() => handleDeleteItem(item._id)}>
                                                                    <FontAwesomeIcon icon={faTrash} className='fs-3 text-danger' />
                                                                    <span className='fs-5 ps-2 fw-bold text-danger'>Delete</span>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => getCrawlError(page, sortOrder, sortColumn, search, error)}>
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
                                                <td colSpan={7} className='text-center'>Data Not Found</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </Table>
                    </div>
                    {filterCrawlError.length > 0 && (
                        <Pagination
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            breakLabel={'...'}
                            pageCount={totalPages}  // Total pages from API
                            marginPagesDisplayed={2}
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

export { CrawlErrorPage }
