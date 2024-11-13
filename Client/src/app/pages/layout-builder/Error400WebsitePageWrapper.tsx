import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { Error400WebsitePage } from './Error400WebsitePage';

const Error400WebsitePageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<Error400WebsitePage />} />
      </Routes>
    </>
  )
}

export default Error400WebsitePageWrapper
