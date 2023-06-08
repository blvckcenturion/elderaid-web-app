// Import necessary components, icons, and modules here
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Notify } from 'notiflix';
import Loader from '../Loader';
import { useUser } from '@/utils/useUser';


const TableComponent = ({ onRowClick, onAddNew }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useUser()
  
  useEffect(() => {
    setCampaigns([])
    setIsLoading(true);

    if (user) {
      // Fetch campaigns from server
      console.log(user)
      axios.get('/api/campaign', { 
        params: { 
          institutionId: user.id 
        } 
      })
        .then(res => {
        setCampaigns(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        Notify.failure('Failed to load campaigns', { position: 'right-top' });
        setIsLoading(false);
      });
    }
  }, [user.id]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token'); 
      setIsLoading(true);
      // Delete a campaign
      await axios.delete(`/api/campaign`, {
        params: {
          id
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      // Replace with your actual API endpoint
      // Remove the deleted campaign from state
      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      Notify.success('Campaign deleted successfully', { position: 'right-top' });
      setIsLoading(false);
    } catch(e) {
      console.log(e)
      Notify.failure('Failed to delete campaign', { position: 'right-top' });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-90 m-auto p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-info">Campaigns</h2>
        <button className="btn btn-primary" onClick={onAddNew}>
          Add New
        </button>
      </div>
      <table className="w-full table-auto text-center">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Requirement</th>
            <th className="border px-2 py-1">Beneficiary Type</th>
            <th className="border px-2 py-1">Start Date</th>
            <th className="border px-2 py-1">End Date</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => (
            <tr key={campaign.id}>
              <td className="border px-2 py-1">{campaign.name}</td>
              <td className="border px-2 py-1">{campaign.requirement}</td>
              <td className="border px-2 py-1">{campaign.beneficiary_type}</td>
              <td className="border px-2 py-1">{new Date(campaign.start_date).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{new Date(campaign.end_date).toLocaleDateString()}</td>
              <td className="border px-2 py-1">{new Date() > new Date(campaign.end_date) ? 'Finalized' : 'Active'}</td>
              <td className="border px-2 py-1 flex flex-row justify-center">
                <button className="btn btn-primary mr-2" onClick={() => onRowClick(campaign)}>
                    <FontAwesomeIcon icon={faEye}  />
                </button>
                <button className="btn btn-error" onClick={() => handleDelete(campaign.id)}>
                  <FontAwesomeIcon icon={faTrashAlt} />

                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;