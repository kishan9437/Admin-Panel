import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { CrawlErrorPage } from './CrawlErrorPage';

const CrawlErrorPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<CrawlErrorPage />} />
      </Routes>
    </>
  )
}

export default CrawlErrorPageWrapper
