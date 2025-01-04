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


interface Activity {
    _id: string;
    url_id: string;
    page_size: number;
    status: string;
    error: string;
    last_render_at: string;
}

const ActivityPage: React.FC = () => {
    const { auth } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filterActivity, setFilterActivity] = useState<Activity[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState<number>()
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortColumn, setSortColumn] = useState<string>('name'); // Default sort column
    const [status, setStatus] = useState<string>("");

    const getActivity = async (page: number = currentPage, order: 'asc' | 'desc' = 'asc', column: string = 'name', search: string = '', selectedStaus: string) => {
        try {
            if (auth && auth.api_token) {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/activities?page=${page}&limit=${itemsPerPage}&search=${search}&order=${order}&status=${selectedStaus}`, {
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                    },
                });
                const data = await response.json();
                // console.log('Fetched activities:', data);
                setActivities(data.items);
                setFilterActivity(data.items);
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
        getActivity(currentPage, newOrder, column, search, status);
    }

    const handlePageClick = (selectedItem: { selected: number }) => {
        const selectedPage = selectedItem.selected + 1;
        setPage(selectedPage);
        getActivity(selectedPage, sortOrder, sortColumn, search, status);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value
        setSearch(searchValue)
        // getActivity(page, sortOrder, sortColumn, searchValue, status)
    }

    const getStatusClass = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'success':
                return 'status-success';
            case 'error':
                return 'status-error';
            default:
                return 'status-unknown';
        }
    };

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
                        const response = await fetch(`http://localhost:5000/api/activities/delete/${id}`, {
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
                                getActivity(page, sortOrder, sortColumn, search, status);
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
        getActivity(currentPage, sortOrder, sortColumn, search, status);
    }, [itemsPerPage, currentPage, search, status])
    return (
        <>
            <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
                <div id="kt_toolbar_container" className="container d-flex flex-stack">
                    <div className="page-title d-flex flex-column">
                        <h1 className="d-flex text-white fw-bold my-1 fs-3">Activity</h1>
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
                            <select
                                id="status-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="form-select form-select-sm mt-0 me-3 "
                            >
                                <option value="">All</option>
                                <option value="success">Success</option>
                                <option value="fail">Fail</option>
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
                    <div className='overflow-x-auto shadow-sm mb-4 rounded'>
                        <Table striped bordered hover responsive="sm" className="table overflow-hidden rounded">
                            <thead>
                                <tr>
                                    {/* <th onClick={() => handleSort('urlid')} className='cursor-pointer'>
                                        Url Id
                                        <span className='ms-1'>
                                            {sortColumn === 'urlid' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th> */}
                                    <th onClick={() => handleSort('PageSize')} className='cursor-pointer'>
                                        Page Size
                                        <span className='ms-1'>
                                            {sortColumn === 'PageSize' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('error')} className='cursor-pointer'>
                                        Error
                                        <span className='ms-1'>
                                            {sortColumn === 'error' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('status')} className='cursor-pointer'>
                                        Status
                                        <span className='ms-1'>
                                            {sortColumn === 'status' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                                        </span>
                                    </th>
                                    <th onClick={() => handleSort('LastRender')} className='cursor-pointer'>
                                        Last Render At
                                        <span className='ms-1'>
                                            {sortColumn === 'LastRender' ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
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
                                                <td><Skeleton count={1} width={60} /></td>
                                                <td><Skeleton count={1} width={80} /></td>
                                                <td><Skeleton count={1} width={120} /></td>
                                                <td><Skeleton count={1} width={220} /></td>
                                                <td></td>
                                            </tr>
                                        ))
                                    ) :
                                        filterActivity.length > 0 ? (
                                            filterActivity.map((item, index) => (
                                                <tr key={index} className='h-50'>
                                                    {/* <td>{item.url_id}</td> */}
                                                    <td>{item.page_size}</td>
                                                    <td>{item.error}</td>
                                                    <td>
                                                        <span className={`status-cell ${getStatusClass(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(item.last_render_at).toLocaleString()}</td>
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
                                                                <Dropdown.Item onClick={() => getActivity(page, sortOrder, sortColumn, search, status)}>
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
                                                <td colSpan={6} className='text-center'>Data Not Found</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </Table>

                    </div>
                    {filterActivity.length > 0 && (
                        <Pagination
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            breakLabel={'...'}
                            pageCount={totalPages}  // Total pages from API
                            marginPagesDisplayed={2}
                            // pageRangeDisplayed={3}
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

export { ActivityPage }
