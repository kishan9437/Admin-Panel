import { PageTitle } from '../../../_metronic/layout/core'
import { Route, Routes } from 'react-router-dom';
import { WebsiteUrlpage } from './WebsiteUrlpage';
import { ActivityPage } from './ActivityPage';

const ActivityPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Layout Builder</PageTitle>
      <Routes>
        <Route path="/" element={<ActivityPage />} />
      </Routes>
    </>
  )
}

export default ActivityPageWrapper
