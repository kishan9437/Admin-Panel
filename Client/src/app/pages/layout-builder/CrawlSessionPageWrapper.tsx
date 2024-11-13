import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { CrawlSessionPage } from './CrawlSessionPage';

const CrawlSessionPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<CrawlSessionPage />} />
      </Routes>
    </>
  )
}

export default CrawlSessionPageWrapper
