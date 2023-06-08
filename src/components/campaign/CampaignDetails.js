import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Notify } from 'notiflix';
import CampaignForm from './CampaignForm';
import Loader from '../Loader';
import CampaignSlider from './CampaignSlider';

const CampaignDetails = ({ campaign, onBack }) => {
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      await axios.delete(`/api/campaign`, {
        params: {
          id: campaign.id
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      Notify.success('Campaign deleted successfully', { position: 'right-top' });
      onBack();
    } catch (error) {
      console.log(error)
      Notify.failure('An error occurred while deleting the campaign', { position: 'right-top' });
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <div className="w-90 m-auto p-4 bg-white rounded shadow">
      {isLoading ? <Loader/> : editMode ? (
        <CampaignForm campaign={campaign} onBack={() => setEditMode(false)} />
      ) : (
        <div>
          <div className="flex justify-between mb-4">
            <button className="btn" onClick={onBack}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
              <button className="btn btn-error" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : <FontAwesomeIcon icon={faTrash} />}
              </button>
            </div>
          </div>
          <CampaignSlider CampaignImages={campaign.CampaignImages}/>
          <h2 className="text-xl font-bold mb-2">{campaign.name}</h2>
          <p className="mb-2"><strong>Beneficiary Type:</strong> {campaign.beneficiary_type}</p>
          <p className="mb-2"><strong>Requirement:</strong> {campaign.requirement}</p>
          <p className="mb-2"><strong>Start Date:</strong> {new Date(campaign.start_date).toLocaleDateString()}</p>
          <p className="mb-2"><strong>End Date:</strong> {new Date(campaign.end_date).toLocaleDateString()}</p>
          <p className="mb-2"><strong>Status:</strong> {new Date() > new Date(campaign.end_date) ? 'Finalizada' : 'Activa'}</p>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;