import { useState, useEffect, useRef } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Notify } from 'notiflix';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Spinner from '../Spinner';
import uploadImage from '@/utils/uploadImage';
import { useUser } from '@/utils/useUser';

const CampaignForm = ({ campaign, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef();

  const initialValues = campaign || {
    name: '',
    requirement: '',
    beneficiary_type: '',
    start_date: '',
    end_date: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    requirement: Yup.string().required('Required'),
    beneficiary_type: Yup.string().required('Required'),
    start_date: Yup.date().required('Required'),
    end_date: Yup.date().required('Required'),
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');  
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const files = Array.from(fileInputRef.current.files);
      const image_urls = [];
      
      if (files.length > 0) {
        for (const file of files) {
          const url = await uploadImage(file);
          image_urls.push(url);
        }
      }
  
      const payload = {
        ...values,
        image_urls // image_urls is now an array of URLs
      };
      console.log(payload)
  
      if (campaign) {
        // PUT request for updating an existing campaign
        await axios.put(`/api/campaigns/${campaign.id}`, payload, config);
        Notify.success('Campaign updated successfully', { position: 'right-top' });
      } else {
        // POST request for creating a new campaign
        await axios.post('/api/campaign', payload, config);
        Notify.success('Campaign created successfully', { position: 'right-top' });
      }
      onBack()
    } catch(e) {
      console.log(e)
      Notify.failure('Failed to submit the form', { position: 'right-top' });
    }
  
    setIsLoading(false);
  };

  return (
    <div className="w-90 m-auto p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <FontAwesomeIcon icon={faArrowLeft} onClick={onBack} />
        <h2 className="text-2xl text-info">{campaign ? 'Edit Campaign' : 'New Campaign'}</h2>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="w-full flex flex-col px-2 py-2">
          {console.log(errors)}
            <div className="form-control">
                <label className="text-primary-text-color mt-4 mb-1" htmlFor="name">Name</label>
                <Field className={`input py-2 input-bordered ${errors.name && touched.name && 'input-error'}`} type="text" id="name" name="name" placeholder="Campaign name" />
                <ErrorMessage name="name" component="div" className="text-primary-text-color" />
            </div>
            <div className="form-control">
              <label className="text-primary-text-color mt-4 mb-1" htmlFor="requirement">Requirement</label>
              <Field className={`input py-2 input-bordered ${errors.requirement && touched.requirement && 'input-error'}`} type="text" id="requirement" name="requirement" placeholder="Campaign requirement" />
               <ErrorMessage name="requirement" component="div" className="text-primary-text-color" />
            </div> 
            <div className="form-control">
              <label className="text-primary-text-color mt-4 mb-1" htmlFor="beneficiary_type">Benefeciary Type</label>
              <Field className={`input py-2 input-bordered ${errors.beneficiary_type && touched.beneficiary_type && 'input-error'}`} type="text" id="beneficiary_type" name="beneficiary_type" placeholder="Campaign Benefeciary Type" />
              <ErrorMessage name="beneficiary_type" component="div" className="text-primary-text-color" />
            </div>
          
            <div className="form-control">
                <label className="text-primary-text-color mt-4 mb-1" htmlFor="start_date">Start Date</label>
                <Field className={`input py-2 input-bordered ${errors.start_date && touched.start_date && 'input-error'}`} type="date" id="start_date" name="start_date" placeholder="Campaign Start Date" />
                <ErrorMessage name="start_date" component="div" className="text-primary-text-color" />
            </div>
            <div className="form-control">
                <label className="text-primary-text-color mt-4 mb-1" htmlFor="end_date">End Date</label>
                <Field className={`input py-2 input-bordered ${errors.end_date && touched.end_date && 'input-error'}`} type="date" id="end_date" name="end_date" placeholder="Campaign End Date" />
                <ErrorMessage name="end_date" component="div" className="text-primary-text-color" />
            </div> 
            <div className="form-control mb-5">
              <label className="text-primary-text-color mt-4 mb-1" htmlFor="image_url">Image</label>
              <input 
                className={`input py-2 input-bordered ${errors.image_url && touched.image_url && 'input-error'}`} 
                type="file" 
                id="image" 
                name="image" 
                accept="image/*" 
                ref={fileInputRef}
                multiple 
              />
            </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Submit'}
            </button>
        </Form>
        )}
      </Formik>
    </div>
  );
};

export default CampaignForm;