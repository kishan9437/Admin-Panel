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
import { useSearchParams } from 'react-router-dom'
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface error500 {
    website_id: string;
    website_url: string;
    status_code: string;
    error_message: number;
    error_type: string;
    retry_attempts: string;
    resolved: string;
    timestamp: string;
    _id: string;
}

const Error500WebsitePage: React.FC = () => {
    const { auth } = useAuth();
    const [error500, setError500] = useState<error500[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filterError500, setFilterError500] = useState<error500[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortColumn, setSortColumn] = useState<string>(''); // Default sort column


    const getError500 = async (page: number = currentPage, order: 'asc' | 'desc' = 'asc', column: string = 'name', search: string = '') => {
        try {
            if (auth && auth.api_token) {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/get-error500website?page=${page}&limit=${itemsPerPage}&search=${search}&order=${order}`, {
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                    },
                });
                const data = await response.json();
                setError500(data.items);

                if (id) {
                    const filtered = data.items.filter((item: error500) => item.website_id === id);
                    if (filtered.length > 0) {
                        setCurrentUrl(filtered[0].website_url)
                    }
                    setFilterError500(filtered);
                    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
                }

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
        getError500(currentPage, newOrder, column);
    }

    const handlePageClick = (selectedPage: { selected: number }) => {
        const selectedPageNumber = selectedPage.selected + 1;
        setCurrentPage(selectedPageNumber);
        getError500(selectedPageNumber,sortOrder);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
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
                        const response = await fetch(`http://localhost:5000/api/error500website/delete/${id}`, {
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
                                getError500();
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
        if (id) {
            getError500(currentPage, sortOrder, search);
        }
    }, [itemsPerPage, currentPage, search])
    return (
        <>
            <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
                <div id="kt_toolbar_container" className="container d-flex flex-stack">
                    <div className="page-title d-flex flex-column">
                        <h1 className="d-flex text-white fw-bold my-1 fs-3">{currentUrl}</h1>
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
                    <div className='overflow-x-auto shadow-sm mb-4 rounded'>
                        <Table striped bordered hover responsive="sm" className="table ">
                            <thead>
                                <tr>
                                    {/* <th>Website Id</th> */}
                                    <th onClick={() => handleSort('Websiteurl')} className='cursor-pointer'>
                                        Website url
                                        <span className='ms-1'>
                                            {sortColumn === 'Websiteurl' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('Status')} className='cursor-pointer'>
                                        Status Code
                                        <span className='ms-1'>
                                            {sortColumn === 'Status' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
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
                                    <th onClick={() => handleSort('Retry')} className='cursor-pointer'>
                                        Retry Attempts 
                                        <span className='ms-1'>
                                            {sortColumn === 'Retry' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('Timestamp')} className='cursor-pointer'>
                                        Timestamp
                                        <span className='ms-1'>
                                            {sortColumn === 'Timestamp' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
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
                                                {/* <td><Skeleton count={1} width={200} /></td> */}
                                                <td><Skeleton count={1} width={180} /></td>
                                                <td><Skeleton count={1} width={40} /></td>
                                                <td><Skeleton count={1} width={60} /></td>
                                                <td><Skeleton count={1} width={100} /></td>
                                                <td><Skeleton count={1} width={40} /></td>
                                                <td><Skeleton count={1} width={200} /></td>
                                                <td></td>
                                            </tr>
                                        ))
                                    ) :
                                        filterError500.length > 0 ? (
                                            filterError500.map((item, index) => (
                                                <tr key={index} className='h-50'>
                                                    {/* <td>{item.website_id}</td> */}
                                                    <td>{item.website_url}</td>
                                                    <td>{item.status_code}</td>
                                                    <td>{item.error_message}</td>
                                                    <td>{item.error_type}</td>
                                                    <td>{item.retry_attempts}</td>
                                                    <td>{item.timestamp}</td>
                                                    <td>
                                                        <Dropdown id='tableDropdown' className='position-relative' align="end">
                                                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" bsPrefix='custom-dropdown-toggle w-auto'>
                                                                <FontAwesomeIcon icon={faEllipsisH} className='fs-3 pt-1' />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu className='custom-dropdown-menu' popperConfig={{ modifiers: [{ name: 'preventOverflow', options: { boundary: 'viewport' } }] }}>
                                                                <Dropdown.Item  >
                                                                    <FontAwesomeIcon icon={faEdit} className='fs-3 text-primary' />
                                                                    <span className='fs-5 ps-2 fw-bold text-primary'>Edit</span>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleDeleteItem(item._id)}>
                                                                    <FontAwesomeIcon icon={faTrash} className='fs-3 text-danger' />
                                                                    <span className='fs-5 ps-2 fw-bold text-danger'>Delete</span>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => getError500()}>
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
                                                <td colSpan={8} className='text-center'>Data Not Found</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </Table>
                    </div>

                </div>
                {filterError500.length > 0 && (
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
            </Content>
        </>
    )
}

export { Error500WebsitePage }
