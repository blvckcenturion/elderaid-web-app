import { useState, useEffect } from 'react';
import { Notify } from 'notiflix';
import axios from 'axios';
import { faEye, faTimes, faTrash, faTruckLoading, faTruckMoving } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { format } from 'date-fns';
import Loader from '../Loader';
import Modal from 'react-modal';
import { useUser } from '@/utils/useUser';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('@/components/MapShow'), {
    ssr: false
  });

const DonationTableComponent = () => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCampaign, setFilterCampaign] = useState('');
    const [filterBenefactor, setFilterBenefactor] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
  const { user } = useUser();
  
  const fetchDonations = async () => {
    setDonations([]);
    setIsLoading(true);
  
    if (user) {
      axios.get('/api/donation', { 
        params: { 
          institutionId: user.id 
        } 
      })
      .then(res => {
        setDonations(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        Notify.failure('Failed to load donations', { position: 'right-top' });
        setIsLoading(false);
      });
    }
  };
    
    useEffect(() => {
      fetchDonations();
    }, [user.id]);
  
    const filteredDonations = donations.filter(donation => {
      const donationDate = new Date(donation.donation_date);
      return (
        (filterStatus === '' || donation.status === filterStatus) &&
        (filterCampaign === '' || donation.Campaign.name.includes(filterCampaign)) &&
        (filterBenefactor === '' || donation.Benefactor.name.includes(filterBenefactor)) &&
        (startDate === '' || donationDate >= new Date(startDate)) &&
        (endDate === '' || donationDate <= new Date(endDate))
      );
    });

    const handleActionClick = (donation) => {
        setSelectedDonation(donation);
        setModalOpen(true);
      };
      
  const clearFilters = () => {
    setFilterStatus("")
    setFilterCampaign("")
    setFilterBenefactor("")
    setStartDate("")
    setEndDate("")
  }    

  const markForPickUp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/donation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: selectedDonation.id, status: 'on_the_way' }),
      });
      if (!response.ok) throw new Error(response.statusText);
      setModalOpen(false);
      setSelectedDonation(null);
      await fetchDonations();
    } catch (error) {
      console.error('Failed to mark donation for pick up:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsCollected = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/donation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: selectedDonation.id, status: 'received' }),
      });
      setModalOpen(false);
      setSelectedDonation(null);
      if (!response.ok) throw new Error(response.statusText);
      await fetchDonations();
    } catch (error) {
      console.error('Failed to mark donation as collected:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
    if (isLoading) {
      return <Loader />;
    }
  

    return (
    <>
    <div className="w-90 m-auto p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-info">Donations</h2>
        <div className="flex">
          <select 
            className="mr-2 input input-bordered"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Filter by status</option>
            <option value="to_collect">To Collect</option>
            <option value="on_the_way">On The Way</option>
            <option value="received">Received</option>
          </select>
          <input 
            className="mr-2 input input-bordered"
            placeholder="Filter by campaign"
            value={filterCampaign}
            onChange={e => setFilterCampaign(e.target.value)}
          />
          <input 
            className="mr-2 input input-bordered"
            placeholder="Filter by benefactor"
            value={filterBenefactor}
            onChange={e => setFilterBenefactor(e.target.value)}
          />
          <input 
            className="mr-2 input input-bordered"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <input 
            className="mr-2 input input-bordered"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
              />
            <button className="btn btn-primary" onClick={clearFilters}>
              <FontAwesomeIcon icon={faTrash}  /> Clear filters
          </button>
        </div>
      </div>
      <table className="w-full table-auto text-center">
        <thead>
          <tr>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Donation Date</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Campaign</th>
                <th className="border px-2 py-1">Benefactor</th>
                <th className="border px-2 py-1">Anonymous</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDonations.map(donation => (
            <tr key={donation.id}>
              <td className="border px-2 py-1">{donation.description}</td>
              <td className="border px-2 py-1">{donation.quantity}</td>
              <td className="border px-2 py-1">{format(new Date(donation.donation_date), 'P')}</td>
              <td className="border px-2 py-1">{donation.status == "to_collect" ? "To Collect" : donation.status == "received" ? "Received" : "On the way to pick up"}</td>
              <td className="border px-2 py-1">{donation.Campaign.name}</td>
              <td className="border px-2 py-1">{donation.Benefactor.name}</td>
              <td className="border px-2 py-1">{donation.anonymous ? "True" : "False"}</td>
              <td className="border px-2 py-1">
                <button className="btn btn-primary" onClick={() => handleActionClick(donation)}>
                    <FontAwesomeIcon icon={faEye}  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Modal
      isOpen={modalOpen}
      onRequestClose={() => setModalOpen(false)}
      contentLabel="Donation Details"
      style={{
        content: {
            maxWidth: '60%',
            margin: 'auto'
        }
      }}
    >
  {selectedDonation && (
    <div className="grid grid-rows-3 gap-4 p-4 border-b border-primary bg-white rounded w-full">
      <div className="border-b border-primary flex flex-col items-center justify-evenly">
        <h2 className="text-xl font-bold mb-2 text-center">Donation Details</h2>
        <p><strong>Description:</strong> {selectedDonation.description}</p>
        <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
        <p><strong>Date:</strong> {format(new Date(selectedDonation.donation_date), 'P')}</p>
        <p><strong>Status:</strong> {selectedDonation.status == "to_collect" ? "To Collect" : selectedDonation.status == "received" ? "Received" : "On the way to pick up"}</p>
        <p><strong>Anonymous:</strong> {selectedDonation.anonymous? "True": "False"}</p>
        <p><strong>Campaign:</strong> {selectedDonation.Campaign.name}</p>
        <p><strong>Benefactor:</strong> {selectedDonation.Benefactor.name}</p>
      </div>
      <div className="border-b pb-5 border-primary">
        <h2 className="text-xl font-bold mb-2 text-center">Benefactor Location</h2>
        <MapWithNoSSR
          lat={selectedDonation.Benefactor.lat}
          lng={selectedDonation.Benefactor.lng}
        />
      </div>
      <div className="flex flex-row justify-center items-center">
      {selectedDonation.status === "to_collect" && (
          <button className="btn btn-primary" onClick={markForPickUp} disabled={isLoading}>
            <FontAwesomeIcon icon={faTruckLoading} className="mr-2" />
            Mark for pick up
          </button>
        )}
        {selectedDonation.status === "on_the_way" && (
          <button className="btn btn-primary" onClick={markAsCollected} disabled={isLoading}>
            <FontAwesomeIcon icon={faTruckMoving} className="mr-2" />
            Mark as collected
          </button>
        )}
        <button className="mx-4 btn btn-secondary" onClick={() => setModalOpen(false)}>
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Close
        </button>
      </div>
    </div>
  )}
</Modal>

    </>
  );
};

export default DonationTableComponent;