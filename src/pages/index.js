import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faHistory, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Loader from '../components/Loader';
import CampaignSlider from '../components/campaign/CampaignSlider';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('@/components/MapShow'), {
  ssr: false
});

export default function HomePage() {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignType, setCampaignType] = useState('active');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        axios.get('/api/campaign')
          .then(response => {
                console.log(response)
                setCampaigns(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('sap',error);
                setLoading(false);
            });
    }, []);

    const handleCampaignClick = (campaign) => {
        setSelectedCampaign(campaign);
    }

    const handleAuthClick = () => {
      router.push('/auth');
    }

  const renderCampaignList = () => {
      const currentDate = new Date();
      const filteredCampaigns = campaigns.filter(campaign => {

        const campaignEndDate = new Date(campaign.end_date);
    
        if (campaignType === 'active') {
            // If the campaignType is 'active', we want to include campaigns where the end_date is greater than or equal to the current date
            return campaignEndDate >= currentDate;
        } else {
            // If the campaignType is 'closed', we want to include campaigns where the end_date is less than the current date
            return campaignEndDate < currentDate;
        }
    });
        
      if (selectedCampaign) {
          return null;
      }

      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredCampaigns.map(campaign => (
                  <div key={campaign.id} className=" my-5 mx-5 card shadow border-primary border-2 ">
                      <figure className="p-0">
                          <img src={campaign.CampaignImages[0]?.image_url} className="h-48 w-full object-contain" />
                      </figure>
                      <div className="card-body">
                          <h2 className="card-title">{campaign.name}</h2>
                          <p>{campaign.requirement}</p>
                          <button className="btn btn-primary mt-4" onClick={() => handleCampaignClick(campaign)}>View Campaign</button>
                      </div>
                  </div>
              ))}
          </div>
      );
    }

    const renderCampaignDetails = () => {
      return (
          <div className="flex flex-col items-center p-10">
              <button className="btn btn-primary self-start mb-6" onClick={() => setSelectedCampaign(null)}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
              <div className="card shadow-lg text-center w-full sm:w-3/4 md:w-3/4 border-primary border-2">
                  <div className='my-2 border-b border-primary'>
                      <CampaignSlider CampaignImages={selectedCampaign.CampaignImages} />
                  </div>
                  <div className="card-body flex flex-col md:flex-row justify-between">
                      <div className="w-full md:w-1/2">
                          <h2 className="text-xl font-bold mb-2">Campaign Details</h2>
                          <p className="mb-2">
                            <strong>Campaign Name:</strong> {selectedCampaign.name}
                          </p>
                          <p className="mb-2">
                              <strong>Beneficiary Type:</strong> {selectedCampaign.beneficiary_type}
                          </p>
                          <p className="mb-2">
                              <strong>Requirement:</strong> {selectedCampaign.requirement}
                          </p>
                          <p className="mb-2">
                              <strong>Start Date:</strong> {new Date(selectedCampaign.start_date).toLocaleDateString()}
                          </p>
                          <p className="mb-2">
                              <strong>End Date:</strong> {new Date(selectedCampaign.end_date).toLocaleDateString()}
                          </p>
                          <p className="mb-2">
                              <strong>Status:</strong> {campaignType === 'active' ? 'Active' : 'Finalized'}
                          </p>
                      </div>
                      <div className="w-full md:w-1/2 mt-6 md:mt-0 md:ml-4">
                          <h2 className="text-xl font-bold mb-2">Institution Details</h2>
                          <div className="mb-4">
                              <img className="w-full h-32 object-contain mb-2" src={selectedCampaign.Institution.image_url} alt={selectedCampaign.Institution.name} />
                              <p className="mb-2"><strong>Name:</strong> {selectedCampaign.Institution.name}</p>
                              <p className="mb-2"><strong>Representative:</strong> {selectedCampaign.Institution.main_representative}</p>
                              <p className="mb-2"><strong>Phone:</strong> {selectedCampaign.Institution.phone}</p>
                              <p className="mb-2"><strong>Address:</strong> {selectedCampaign.Institution.address}</p>
                          </div>
                      </div>
                      <div className="w-full md:w-1/2 mt-6 md:mt-0 md:ml-4">
                              <MapWithNoSSR lat={selectedCampaign.Institution.lat} lng={selectedCampaign.Institution.lng} />
                        
                      </div>
                  </div>
              </div>
          </div>
      );
  }

    return (
        <div className="h-screen w-screen flex flex-col" >
            <header className="h-15 w-full shadow-md flex bg-base-100 justify-between items-center p-4">
                <div className="flex items-center">
                    <Image height={150} width={150} src="/images/logo.png" className="h-12 w-10 mr-2" alt="ElderAid logo" />
                    <h1>ElderAid</h1>
                </div>
                <button onClick={handleAuthClick} className="btn btn-primary">Go to Auth</button>
            </header>
            <main className="h-90 w-full flex flex-col overflow-auto">
                {loading ? <Loader /> :
                selectedCampaign ? renderCampaignDetails() :
                <div>
                    <div className="flex justify-center items-center p-4 space-x-4">
                      <button onClick={() => setCampaignType('active')} className={`btn ${campaignType === 'active' ? 'btn-primary' : 'btn-neutral'}`}>
                          <FontAwesomeIcon icon={faFire} /> Active Campaigns
                      </button>
                      <button onClick={() => setCampaignType('closed')} className={`btn ${campaignType === 'closed' ? 'btn-primary' : 'btn-neutral'}`}>
                          <FontAwesomeIcon icon={faHistory} /> Closed Campaigns
                      </button>
                  </div>
                    <div className="overflow-auto">
                        {renderCampaignList()}
                    </div>
                </div>}
            </main>
        </div>
    );
}