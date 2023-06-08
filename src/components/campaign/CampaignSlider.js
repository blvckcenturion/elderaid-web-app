import { useState } from 'react';

const CampaignSlider = ({ CampaignImages }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            return prevIndex === CampaignImages.length - 1 ? 0 : prevIndex + 1;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            return prevIndex === 0 ? CampaignImages.length - 1 : prevIndex - 1;
        });
    };

    return (
        <div className="flex flex-col items-center justify-center overflow-hidden">
            <div className="flex w-full h-[25vh] overflow-hidden relative">
                {CampaignImages.map((image, index) => (
                    <div 
                        key={image.id}
                        className={`absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img className="max-h-full max-w-full object-cover" src={image.image_url} alt={`Campaign slide ${index}`} />
                    </div>
                ))}
            </div>
            <div className="flex mt-4">
                <button className="btn btn-primary m-2" onClick={prevSlide}>Previous</button>
                <button className="btn btn-primary m-2" onClick={nextSlide}>Next</button>
            </div>
        </div>
    );
};

export default CampaignSlider;