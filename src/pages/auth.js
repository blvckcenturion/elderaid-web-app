import { ErrorMessage, Field, Form, Formik } from "formik"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import * as Yup from "yup"
import Image from 'next/image';
import { Notify } from "notiflix";
import dynamic from "next/dynamic";
import Spinner from "@/components/Spinner";

import uploadImage from "@/utils/uploadImage";

const MapWithNoSSR = dynamic(() => import('@/components/MapComponent'), {
    ssr: false
});

export default function Auth() {

    useEffect(() => {
        if (localStorage.getItem('token')) {
            router.push('/dashboard')
        }
    }, [])


    const router = useRouter()
    const [formMode, setFormMode] = useState("login")
    const [loading, setLoading] = useState(false)

    const LoginSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
        password: Yup.string().required('Required'),
    });

    const SignUpSchema = Yup.object().shape({
        name: Yup.string().required('Required'),
        NIT: Yup.string().required('Required'),
        main_representative: Yup.string().required('Required'),
        email: Yup.string().email('Invalid email').required('Required'),
        phone: Yup.string().required('Required'),
        address: Yup.string().required('Required'),
        cellphone: Yup.string().required('Required'),
        lat: Yup.number().optional('Required'),
        lng: Yup.number().optional('Required'),
        password: Yup.string().required('Required'),
        image_url: Yup.mixed().required('Required'),
    });

    const handleSubmitLogin = async (values) => { 
        try {
            setLoading(true)

            // Call API
            const response = await fetch('/api/auth', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            console.log(response)
            
            // Check if request was successful
            if (!response.ok) {
                throw new Error('Could not authenticate user');
            }
    
            const { token } = await response.json();
    
            // Save the JWT token somewhere safe (for example, in a state or in local storage)
            // For example: localStorage.setItem('token', token);
            localStorage.setItem('token', token);
    
            console.log('User successfully authenticated', token);
            Notify.success('Login successful', { position: 'right-top' });
            await router.push('/dashboard')
        } catch (error) {
            console.error('Error:', error);
            Notify.failure('Credenciales Invalidos.', { position: 'right-top' });
        } finally {
            setLoading(false)
        }
    };

    const handleSubmitSignup = async (values) => { 
        try {
            setLoading(true)
            
            await uploadImage(values.image_url).then(
                (url) => {
                    console.log(url)
                    values.image_url = url
                }
            ).catch(
                (error) => {
                    console.log(error)
                }
            )
            // Call API
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            // Check if request was successful
            if (!response.ok) {
                throw new Error('Could not authenticate user');
            }

            const { token } = await response.json();

            // Save the JWT token somewhere safe (for example, in a state or in local storage)
            // For example: localStorage.setItem('token', token);
            localStorage.setItem('token', token);
            Notify.success('Login successful', { position: 'right-top' })
            await router.push('/dashboard')
        } catch (error) {
            console.error('Error:', error);
            Notify.failure('Credenciales Invalidos.', { position: 'right-top' });
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex items-center justify-center h-screen bg-primary bg-opacity-25">
            <div className="absolute w-full h-full animate-gradient-x bg-gradient-to-r from-accent to-success via-secondary" />
            <div className="relative flex items-center justify-between w-2/3 p-6 bg-base-100 bg-opacity-60 backdrop-blur-sm rounded-md shadow-xl">
                <div className="w-full md:w-3/4">
                    <h2 className="mb-4 text-2xl font-bold text-center text-success">{formMode.toUpperCase()}</h2>
                    {
                        formMode === "login" ? (
                            <Formik
                            initialValues={{ email: 'usuarioexample@gmail.com', password: 'santiago' }}
                            validationSchema={LoginSchema}
                            onSubmit={handleSubmitLogin}
                            >
                            {({ errors, touched }) => (
                                <Form className="flex flex-col">
                                <label htmlFor="email" className="text-primary-text-color mb-1">Email</label>
                                <Field name="email" type="text" className={`input input-bordered ${errors.email && touched.email && 'input-error'}`} />
                                <ErrorMessage name="email" component="div" className="text-primary-text-color" />
                                <label htmlFor="password" className="text-primary-text-color mt-4 mb-1">Password</label>
                                <Field name="password" type="password" className={`input input-bordered ${errors.password && touched.password && 'input-error'}`} />
                                <ErrorMessage name="password" component="div" className="text-primary-text-color" />
                                    <button type="submit" className="btn btn-primary mt-6" disabled={loading}>
                                        {loading ? <Spinner /> : 'Login'}
                                    </button>
                                </Form>
                            )}
                            </Formik>
                        ): (
                            <Formik
                                initialValues={{
                                    name: '',
                                    NIT: '',
                                    main_representative: '',
                                    email: '',
                                    phone: '',
                                    cellphone:'',
                                    address: '',
                                    lat: 0,
                                    lng: 0,
                                    password: ''
                                }}
                                validationSchema={SignUpSchema}
                                onSubmit={handleSubmitSignup}
                                >
                                    {({ errors, touched }) => (
                                        <Form className="flex flex-col max-h-[70vh] overflow-auto px-2 py-2">
                                        <label htmlFor="name" className="text-primary-text-color mb-1">Name</label>
                                        <Field name="name" type="text" className={`input py-2 input-bordered ${errors.name && touched.name && 'input-error'}`} />
                                        <ErrorMessage name="name" component="div" className="text-primary-text-color" />
                                        <label htmlFor="NIT" className="text-primary-text-color mt-4 mb-1">NIT</label>
                                        <Field name="NIT" type="text" className={`input py-2 input-bordered ${errors.NIT && touched.NIT && 'input-error'}`} />
                                        <ErrorMessage name="NIT" component="div" className="text-primary-text-color" />
                                        <label htmlFor="main_representative" className="text-primary-text-color mt-4 mb-1">Main Representative</label>
                                        <Field name="main_representative" type="text" className={`input py-2 input-bordered ${errors.main_representative && touched.main_representative && 'input-error'}`} />
                                        <ErrorMessage name="main_representative" component="div" className="text-primary-text-color" />
                                        <label htmlFor="email" className="text-primary-text-color mt-4 mb-1">Email</label>
                                        <Field name="email" type="text" className={`input py-2 input-bordered ${errors.email && touched.email && 'input-error'}`} />
                                        <ErrorMessage name="email" component="div" className="text-primary-text-color" />
                                        <label htmlFor="phone" className="text-primary-text-color mt-4 mb-1">Phone</label>
                                        <Field name="phone" type="text" className={`input py-2 input-bordered ${errors.phone && touched.phone && 'input-error'}`} />
                                        <ErrorMessage name="phone" component="div" className="text-primary-text-color" />
                                        <label htmlFor="cellphone" className="text-primary-text-color mt-4 mb-1">Cellphone</label>
                                        <Field name="cellphone" type="text" className={`input py-2 input-bordered ${errors.cellphone && touched.cellphone && 'input-error'}`} />
                                        <ErrorMessage name="cellphone" component="div" className="text-primary-text-color" />    
                                        <label htmlFor="address" className="text-primary-text-color mt-4 mb-1">Address</label>
                                        <Field name="address" type="text" className={`input py-2 input-bordered ${errors.address && touched.address && 'input-error'}`} />
                                        <ErrorMessage name="address" component="div" className="text-primary-text-color" />
                                        <label htmlFor="location" className="text-primary-text-color mt-4 mb-1">Location</label>    
                                        <div className=" w-full p-2 bg-main-bg-color text-main-text-color border rounded border-main-text-color">
                                        <Field name="location">
                                            {({ field, form }) => (
                                                <MapWithNoSSR formik={form} />
                                            )}
                                        </Field>
                                        </div>
                                        <label htmlFor="image_url" className="text-primary-text-color mt-4 mb-1">Image</label>
                                        <Field name="image_url">
                                            {({ field, form }) => (
                                                <input className=" w-full p-10 bg-main-bg-color text-main-text-color border rounded border-main-text-color" id="image_url" name="image_url" type="file" onChange={(event) => {
                                                    form.setFieldValue("image_url", event.currentTarget.files[0]);
                                                }} />
                                            )}
                                        </Field>
                                        <ErrorMessage name="image_url" component="div" className="text-primary-text-color" />    
                                        <ErrorMessage name="location" component="div" className="text-primary-text-color" />
                                        <label htmlFor="password" className="text-primary-text-color mt-4 mb-1">Password</label>
                                        <Field name="password" type="password" className={`input py-2 input-bordered ${errors.password && touched.password && 'input-error'}`} />
                                        <ErrorMessage name="password" component="div" className="text-primary-text-color" />
                                        
                                        <button type="submit" className="btn btn-primary mt-6" disabled={loading}>
                                                {loading ? <Spinner /> : 'Sign Up'}
                                        </button>
                                    </Form>
                                    )}
                                </Formik>
                        )
                    }
                    <div className="flex justify-center mt-4">
                        {!loading && (
                            <>
                            <button
                            type="button"
                            onClick={() => setFormMode(prevMode => prevMode === 'login' ? 'signup' : 'login')}
                            className="btn btn-info mx-3"
                            >
                            Switch to {formMode === 'login' ? 'Sign Up' : 'Login'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="btn btn-info"
                                >
                                Go to main page
                            </button>
                            
                            </>
                        )}
                    </div>
                </div>
                <div className="hidden w-1/3 md:flex md:justify-center">
                    <Image src="/images/logo.png" alt="Logo" width={150} height={150} />
                </div>
            </div>
        </div>
    )
}