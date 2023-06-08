import { useState } from 'react';
import CampaignForm from './CampaignForm';
import CampaignDetails from './CampaignDetails';
import TableComponent from './TableComponent';

const CampaignManager = () => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const handleRowClick = (campaign) => {
    setSelectedCampaign(campaign);
    setViewMode('detail');
  };

  const handleAddNew = () => {
    setSelectedCampaign(null);
    setViewMode('form');
  };
    
    const handleOnBack = () => {
        setSelectedCampaign(null)
        setViewMode('table')
    }

  return (
    <>
        {viewMode === 'table' && <TableComponent onRowClick={handleRowClick} onAddNew={handleAddNew} />}
        {viewMode === 'form' && <CampaignForm onSubmit={handleAddNew} onBack={handleOnBack} initialCampaign={selectedCampaign} />}
        {viewMode === 'detail' && <CampaignDetails campaign={selectedCampaign} onBack={handleOnBack} />}
    </>
  );
};

export default CampaignManager;