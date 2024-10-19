import React, { useState, useEffect, HtmlHTMLAttributes } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Pagination from 'react-paginate'
import { Content } from '../../../_metronic/layout/components/Content'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../modules/auth'

interface Item {
  id: number;
  name: string;
  url: string;
}

const BuilderPage: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { auth } = useAuth();

  const getAllWebsites = async () => {
    try {
      if (auth && auth.api_token) {
        const response = await fetch('http://localhost:5000/api/websites', {
          headers: {
            Authorization: `Bearer ${auth.api_token}`,
          },
        });
        const data = await response.json();
        setData(data.items);
        // console.log(data)
      } else {
        console.error('No valid auth token available');
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim().toLowerCase()
    setSearchTerm(value);
    setCurrentPage(0);
    // searchTerm=value.split(' ');
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
  }
  
  const filteredData = data.filter((item) => {
    const nameWords = item.name.toLowerCase().split(' ');
    const urlWords = item.url.toLowerCase().split(' ');
    const searchWords = searchTerm.toLowerCase().split(' ');

    return searchWords.every((word) =>
      nameWords.some(nameWord => nameWord.includes(word)) ||
      urlWords.some(urlWord => urlWord.includes(word))
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  })

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);
  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
    // setCurrentPage(sortedData)
  };

  const alldata = sortedData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleEditItem = (item: Item) => {
    console.log('Editing', item);
  }

  const handleDeleteItem = (item: Item) => {
    console.log('Deleting', item);
  }

  useEffect(() => {
    getAllWebsites()
  }, [])
  return (
    <>
      {/* <Toolbar /> */}

      <div className="toolbar py-5 py-lg-15" id="kt_toolbar">
        <div id="kt_toolbar_container" className="container d-flex flex-stack">
          <div className="page-title d-flex flex-column">
            <h1 className="d-flex text-white fw-bold my-1 fs-3">Websites</h1>
          </div>
          <div className="d-flex align-items-center py-1">
            <a className="btn bg-body btn-active-color-primary" id="kt_toolbar_primary_button" data-bs-theme="light">New</a>
          </div>
        </div>
      </div>
      <Content>
        <div className="container" id='tableContainer'>
          <div className='searchContainer'>
            <span className='pt-1 pe-3 text-white fs-5 fw-bold'>Search : </span>
            <Form.Control
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="mb-3"
            />
          </div>
          <Table striped bordered hover responsive="sm" className="table">
            <thead>
              <tr>
                <th>No</th>
                <th onClick={handleSort} className='cursor-pointer'>Name <span className='ms-1 mt-3'>{sortOrder === 'asc' ? "↑" : "↓"}</span>
                </th>
                <th>Url</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alldata.length > 0 ? (
                alldata.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1 + currentPage * itemsPerPage}</td>
                    <td>{item.name}</td>
                    {/* <td>{item.url}</td> */}
                    <td><a href={item.url} target='_blank'>{item.url}</a></td>
                    <td>
                      <button onClick={() => handleEditItem(item)} className='actionIcons editBackground'>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => handleDeleteItem(item)} className='actionIcons deleteBackground'>
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

          <Pagination
            // className=''
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={"pagination justify-content-right "}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextClassName={"page-item"}
            nextLinkClassName={"page-link"}
            breakClassName={"page-item"}
            breakLinkClassName={"page-link"}
            activeClassName={"active"}
          />
        </div>
      </Content>
    </>
  )
}

export { BuilderPage }
