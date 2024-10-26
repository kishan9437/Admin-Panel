import React, { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Pagination from 'react-paginate'
import { Content } from '../../../_metronic/layout/components/Content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../modules/auth'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Item {
  _id: string;
  access_key: string,
  name: string,
  status: string,
  url: string;
}

const BuilderPage: React.FC = () => {
  const [website, setWebsite] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [filterWebsite, setFilterWebsite] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 5;
  const { auth } = useAuth();

  const getAllWebsites = async (page: number = 1, order: 'asc' | 'desc' = 'asc') => {
    try {
      if (auth && auth.api_token) {
        const response = await fetch(`http://localhost:5000/api/websites?page=${page}&limit=${itemsPerPage}&order=${order}`, {
          headers: {
            Authorization: `Bearer ${auth.api_token}`,
          },
        });
        const data = await response.json();
        setWebsite(data.websites);
        setFilterWebsite(data.websites);
        setTotalPages(data.totalPages);
        // console.log(data)
      } else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  }

  // Handle page click for pagination
  const handlePageClick = (selectedPage: { selected: number }) => {
    const selectedPageNumber = selectedPage.selected + 1;  // Paginate starts at 0
    setCurrentPage(selectedPageNumber);
    getAllWebsites(selectedPageNumber);  // Fetch data for new page
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim().toLowerCase()
    setSearch(value);

    if (value === "") {
      setFilterWebsite(website);
    }
    else {
      const searchTerm = value.split(' ');
      const filtered = website.filter((user) => {
        return searchTerm.some((term) =>
          user.name.toLowerCase().includes(term) ||
          user.url.toLowerCase().includes(term)
        )
      });
      setFilterWebsite(filtered)
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    getAllWebsites(currentPage, newOrder);
  }

  const handleDeleteItem = async (id: string) => {
    try {
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
        else{
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

  useEffect(() => {
    getAllWebsites(currentPage, sortOrder);
  }, []);

  return (
    <>
      {/* <Toolbar /> */}

      <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
        <div id="kt_toolbar_container" className="container d-flex flex-stack">
          <div className="page-title d-flex flex-column">
            <h1 className="d-flex text-white fw-bold my-1 fs-3">Websites</h1>
          </div>
          <div className="d-flex align-items-center py-1">
            <Link to='/builder/add-websites' className="btn bg-body btn-active-color-primary" id="kt_toolbar_primary_button" data-bs-theme="light">New</Link>
          </div>
        </div>
      </div>
      <Content>
        <div className="container" id='tableContainer'>
          <div className='searchContainer'>
            {/* <span className='pt-1 pe-3 text-white fs-5 fw-bold'>Search : </span> */}
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearch}
              className="mb-3"
            />
          </div>
          <Table striped bordered hover responsive="sm" className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Access_key</th>
                <th onClick={handleSort} className='cursor-pointer'>
                  Name
                  <span className='ms-1 mt-3'>
                    {sortOrder === 'asc' ? "↑" : "↓"}
                  </span>
                </th>
                <th>Url</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filterWebsite.length > 0 ? (
                filterWebsite.map((item,index) => (
                  <tr key={index}>
                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td>{item.access_key}</td>
                    <td>{item.name}</td>
                    {/* <td>{item.url}</td> */}
                    <td><a href={item.url} target='_blank'>{item.url}</a></td>
                    <td>{item.status}</td>
                    <td>
                      <Link to={`/builder/update-website/${item._id}`}>
                        <button className='actionIcons editBackground'>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </Link>
                      <button onClick={() => handleDeleteItem(item._id)} className='actionIcons deleteBackground'>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className='text-center'>Data Not Found</td>
                </tr>
              )}

            </tbody>
          </Table>
          {/* Pagination */}
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

export { BuilderPage }
