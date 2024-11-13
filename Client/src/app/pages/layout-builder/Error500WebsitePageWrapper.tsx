import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { CrawlErrorPage } from './CrawlErrorPage';
import { Error500WebsitePage } from './Error500WebsitePage';

const Error500WebsitePageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<Error500WebsitePage />} />
      </Routes>
    </>
  )
}

export default Error500WebsitePageWrapper
