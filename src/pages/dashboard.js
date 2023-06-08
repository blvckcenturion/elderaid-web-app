import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faHandHoldingHeart, faDonate } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useRouter } from "next/router"
import { useUser } from '@/utils/useUser';
import Loader from '@/components/Loader';
import CampaignManager from '@/components/campaign/CampaignManager';
import DonationTableComponent from '@/components/donations/DonationTableComponent';

export default function Dashboard() {
    const router = useRouter()
    const { user, isLoading, isError } = useUser()
    const [selectedOption, setSelectedOption] = useState("Campaigns");

    if (isLoading) {
        return <Loader/>
    }
    if (!isLoading && isError) {
        localStorage.removeItem('token')
        router.push('/auth')
    } else {
        return (
            <div className="h-screen w-screen flex">
                <div className="w-64 h-screen shadow flex flex-col p-4 space-y-6 bg-neutral">
                <div className="flex items-center justify-center space-x-4 mb-6 h-1/6 border-b-2 border-sidebar-divider">
                        <Image src="/images/logo.png" alt="logo" className="w-8 h-10" height={200} width={200} />
                        <span className="text-lg font-bold text-primary-text-color">Elder Aid</span>
                    </div>
                    <div className="flex flex-col space-y-4 mb-6 h-1/2 border-b-2 border-sidebar-divider">
                        {[
                            { label: 'Campaigns', icon: faHandHoldingHeart },
                            { label: 'Donations', icon: faDonate },
                        ].map((option) => (
                            <button
                                key={option.label}
                                className={`btn ${selectedOption === option.label ? 'btn-primary' : 'btn-secondary'} rounded text-sidebar-dark-color hover:text-sidebar-dark-color`}
                                onClick={() => setSelectedOption(option.label)}
                            >
                                <FontAwesomeIcon icon={option.icon} /> {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex w-full flex-col items-center space-x-4 mb-6 h-1/6 border-b-2 border-sidebar-divider">
                        <Image src={user.image_url} height={250} width={250} alt="user" className="w-12 h-12 rounded-full" />
                        <span className="text-lg mt-5 font-bold text-primary-text-color" style={{ wordWrap: "break-word", maxWidth: "100%" }}>{user.name}</span>
                    </div>
                    <button className="btn btn-primary py-2 px-4 rounded bg-danger hover:bg-danger-darker text-white h-1/10" onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/auth')
                    }}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
                    </button>
                </div>
                <div className="flex-grow p-4">
                    {selectedOption === 'Campaigns' && <CampaignManager/>}
                    {selectedOption === 'Donations' && <DonationTableComponent/>}
                </div>
            </div>
        );
    }
}