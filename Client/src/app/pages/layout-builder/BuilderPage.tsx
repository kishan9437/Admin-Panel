import React, { useState, useEffect, useRef } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Pagination from 'react-paginate'
import { Content } from '../../../_metronic/layout/components/Content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEllipsisH, faSync, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../modules/auth'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Button, Dropdown } from 'react-bootstrap'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom'
import Modal from 'bootstrap/js/dist/modal';



interface Item {
  _id: string;
  access_key: string,
  name: string,
  status: string,
  url: string;
  website_id: string,
  totalItems?: number;
}

interface WebsiteUrl {
  website_id: string;
}
interface BuilderPage {
  item: Item;
  websiteId: string;
}
const BuilderPage: React.FC = () => {
  const [website, setWebsite] = useState<Item[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterWebsite, setFilterWebsite] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1)
  const [name, setName] = useState<string>('');
  const [url, setURL] = useState<string>('');
  const [nameUpdate, setNameUpdate] = useState<string>('');
  const [urlUpdate, setURLUpdate] = useState<string>('');
  const [currentId, setCurrentId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const navigate = useNavigate();

  const getAllWebsites = async (page: number = 1, order: 'asc' | 'desc' = 'asc', search: string = '') => {
    try {
      if (auth && auth.api_token) {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/websites?page=${page}&limit=${itemsPerPage}&order=${order}&search=${search}`, {
          headers: {
            Authorization: `Bearer ${auth.api_token}`,
          },
        });
        const data = await response.json();

        const websitesWithTotalItems = await Promise.all(
          data.websites.map(async (website: Item) => {
            const totalItems = await fetchUrlTotal(website._id);
            return { ...website, totalItems };
          })
        );

        setWebsite(websitesWithTotalItems);
        setFilterWebsite(websitesWithTotalItems);
        setTotalPages(data.totalPages);

        setLoading(false);
      } else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  }

  const fetchUrlTotal = async (websiteId: string) => {
    try {
      if (auth && auth.api_token) {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/website-urls-id/${websiteId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${auth.api_token}`
          }
        });
        const data = await response.json();
        // console.log(data);
        return data.totalItems ?? null;

      } else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error('Error fetching website URL by ID', error);
      setLoading(false);
    }
  }

  // Handle page click for pagination
  const handlePageClick = (selectedPage: { selected: number }) => {
    const selectedPageNumber = selectedPage.selected + 1;
    setCurrentPage(selectedPageNumber);
    getAllWebsites(selectedPageNumber);
  };

  // const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value.trim().toLowerCase()
  //   setSearch(value);

  //   if (value === "") {
  //     setFilterWebsite(website);
  //   }
  //   else {
  //     const searchTerm = value.split(' ');
  //     const filtered = website.filter((user) => {
  //       return searchTerm.some((term) =>
  //         user.name.toLowerCase().includes(term) ||
  //         user.url.toLowerCase().includes(term)
  //       )
  //     });
  //     setFilterWebsite(filtered)
  //   }
  // };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1)
  }

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    getAllWebsites(currentPage, newOrder);
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
            const response = await fetch(`http://localhost:5000/api/website/delete/${id}`, {
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
                getAllWebsites();
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

  const getStatusClass = (status: 'Pending' | 'Complete' | 'Error' | 'Active' | 'Inactive'): string => {
    switch (status) {
      case 'Complete':
        return 'status-complete';
      case 'Error':
        return 'status-error';
      case 'Active':
        return 'status-active';
      case 'Inactive':
        return 'status-inactive';
      default:
        return 'status-pending';
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleError500 = (id: string) => {
    navigate(`/500Error?id=${id}`)
  }

  const handleError400 = (id: string) => {
    navigate(`/400Error?id=${id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (auth && auth.api_token) {
        const response = await fetch('http://localhost:5000/api/add-website', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.api_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, url })
        })
        const newWebsite = await response.json();

        if (response.ok) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Success',
            text: 'Data Added successfully',
            confirmButtonText: "OK"
          }).then(() => {
            setName('');
            setURL('');
            getAllWebsites();
            // navigate('/builder')
          })
        }
        else {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Error',
            text: 'Failed to add data',
            confirmButtonText: "OK"
          })
        }
      }
      else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getWebsiteData = async (id: string) => {
    try {
      if (auth && auth.api_token) {
        const response = await fetch(`http://localhost:5000/api/websites/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${auth.api_token}`
          }
        });
        const items = await response.json();
        setNameUpdate(items.data.name);
        setURLUpdate(items.data.url);
      }
      else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleEditClick = (id: string) => {
    setCurrentId(id);
    getWebsiteData(id);
    if (modalRef.current) {
      const modal = new Modal(modalRef.current);
      modal.show();
    }
  }

  const handleUpdateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (auth && auth.api_token && currentId) {
        const response = await fetch(`http://localhost:5000/api/website/update/${currentId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${auth.api_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nameUpdate,
            url: urlUpdate
          })
        })
        // const result= await response.json();
        if (response.ok) {
          Swal.fire({
            position: 'center',
            title: 'Success!',
            text: 'Data updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => getAllWebsites());
        }
        else {
          console.error('Error updating websites', response.statusText);
          Swal.fire({
            position: 'center',
            title: 'Error!',
            text: 'Error updating data. Please try again',
            icon: 'error',
            confirmButtonText: 'OK'
          })
        }
      }
      else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getAllWebsites(currentPage, sortOrder, search);
  }, [itemsPerPage, currentPage, search]);

  return (
    <>
      {/* <Toolbar /> */}

      <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
        <div id="kt_toolbar_container" className="container d-flex flex-stack">
          <div className="page-title d-flex flex-column">
            <h1 className="d-flex text-white fw-bold my-1 fs-3">Websites</h1>
          </div>
          <div className="d-flex align-items-center py-1">
            <button
              type="button"
              className="btn bg-body btn-active-color-primary"
              id="kt_toolbar_primary_button"
              data-bs-toggle="modal"
              data-bs-target="#addWebsiteModal"
            >
              New
            </button>
            {/* Modal Structure */}
            <div
              className="modal fade"
              id="addWebsiteModal"
              tabIndex={-1}
              aria-labelledby="addWebsiteModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addWebsiteModalLabel">
                      Enter Website Name and URL
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form className="form" onSubmit={handleSubmit}>
                      {/* Name Field */}
                      <div className="mb-3">
                        <label className="form-label fw-bold mb-1" htmlFor="name">
                          Name:
                        </label>
                        <input
                          type="text"
                          className="form-control bg-transparent"
                          id="name"
                          placeholder="Enter Website Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      {/* URL Field */}
                      <div className="mb-3">
                        <label className="form-label fw-bold mb-1" htmlFor="url">
                          URL:
                        </label>
                        <input
                          type="text"
                          className="form-control bg-transparent"
                          id="url"
                          placeholder="Enter Website URL"
                          value={url}
                          onChange={(e) => setURL(e.target.value)}
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          data-bs-dismiss="modal"
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
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

            {/* update modal */}
            <div
              className="modal fade"
              ref={modalRef}
              id="editModalLabel"
              tabIndex={-1}
              aria-labelledby="editModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="editModalLabel">
                      Update Websites Name And URL
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleUpdateWebsite}>
                      {/* Name Field */}
                      <div className="mb-3">
                        <label className="form-label fw-bold mb-1" htmlFor="name">
                          Name:
                        </label>
                        <input
                          type="text"
                          className="form-control bg-transparent"
                          id="name"
                          placeholder="Enter Website Name"
                          value={nameUpdate}
                          onChange={(e) => setNameUpdate(e.target.value)}
                          required
                        />
                      </div>

                      {/* URL Field */}
                      <div className="mb-3">
                        <label className="form-label fw-bold mb-1" htmlFor="url">
                          URL:
                        </label>
                        <input
                          type="text"
                          className="form-control bg-transparent"
                          id="url"
                          placeholder="Enter Website URL"
                          value={urlUpdate}
                          onChange={(e) => setURLUpdate(e.target.value)}
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          data-bs-dismiss="modal"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
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
      </div>
      <Content>
        <div className="container" id='tableContainer'>
          <div className='searchContainer'>
            {/* <span className='pt-1 pe-3 text-white fs-5 fw-bold'>Search : </span> */}
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
          <div className='overflow-x-auto shadow-sm mb-4'>
            <Table striped bordered hover responsive="sm" className="table overflow-hidden rounded">
              <thead>
                <tr>
                  {/* <th>No</th> */}
                  <th onClick={handleSort} className='cursor-pointer'>
                    Name
                    <span className='ms-1 mt-3'>
                      {sortOrder === 'asc' ? "↑" : "↓"}
                    </span>
                  </th>
                  <th>Url</th>
                  <th>Access_key</th>
                  <th>Status</th>
                  <th>Error </th>
                  {/* <th>Error 400</th> */}
                  <th>Total Urls</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index}>
                      {/* <td><Skeleton count={1} width={20} /></td> */}
                      <td><Skeleton count={1} width={70} /></td>
                      <td><Skeleton count={1} width={200} /></td>
                      <td><Skeleton count={1} width={120} /></td>
                      <td><Skeleton count={1} width={70} /></td>
                      <td><Skeleton count={1} width={70} /></td>
                      {/* <td><Skeleton count={1} width={70} /></td> */}
                      <td><Skeleton count={1} width={70} /></td>
                      <td></td>
                    </tr>
                  ))
                ) : filterWebsite.length > 0 ? (
                  filterWebsite.map((item, index) => (
                    <tr key={index} className='h-50'>
                      {/* <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td> */}
                      <td>{item.name}</td>
                      {/* <td>{item.url}</td> */}
                      <td><Link to={`/websiteurl/${item._id}`}>
                        {item.url}
                      </Link>
                      </td>
                      <td>{item.access_key}</td>
                      <td>
                        <span className={`status-cell ${getStatusClass(item.status as 'Pending' | 'Complete' | 'Error' | 'Active' | 'Inactive')}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="secondary" id={`dropdown-${item._id}`} size="sm">
                              All Error
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleError500(item._id)} className="text-danger">
                                <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i> Error 500
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleError400(item._id)} className="text-warning">
                                <i className="bi bi-exclamation-circle-fill me-2 text-warning"></i> Error 400 
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                      </td>

                      {/* <td></td> */}
                      <td>{item.totalItems ?? 'N/A'}</td>
                      <td>
                        <Dropdown id='tableDropdown'>
                          <Dropdown.Toggle variant="secondary" id="dropdown-basic" bsPrefix='custom-dropdown-toggle w-auto'>
                            <FontAwesomeIcon icon={faEllipsisH} className='fs-3 pt-1' />
                          </Dropdown.Toggle>

                          <Dropdown.Menu className='custom-dropdown-menu'>
                            <Dropdown.Item as="button" onClick={() => handleEditClick(item._id)}>
                              <FontAwesomeIcon icon={faEdit} className='fs-3 text-primary' />
                              <span className='fs-5 ps-2 fw-bold text-primary'>Edit</span>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeleteItem(item._id)}>
                              <FontAwesomeIcon icon={faTrash} className='fs-3 text-danger' />
                              <span className='fs-5 ps-2 fw-bold text-danger'>Delete</span>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => getAllWebsites()}>
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
                    <td colSpan={9} className='text-center'>Data Not Found</td>
                  </tr>
                )
                }
              </tbody>
            </Table>
          </div>
          {filterWebsite.length > 0 && (
            <Pagination
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={totalPages}
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

          {/* Pagination */}

        </div>
      </Content>
    </>
  )
}

export { BuilderPage }
