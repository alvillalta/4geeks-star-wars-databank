import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

import { getAgenda, deleteContact } from "../services/contact-services.js"

import defaultContactImageError from "../assets/default-contact-image-error.jpg";

export const ContactList = () => {

    // Declarations
    const navigate = useNavigate();

    const { store, dispatch } = useGlobalReducer();
    const contacts = store.contacts;

    // UseEffect
    useEffect(() => {
        const getAgendaInComponent = async () => {
            const contacts = await getAgenda();
            dispatch({
                type: "GET-AGENDA",
                payload: contacts
            });
        }
        getAgendaInComponent();
    }, [])

    // Handlers
    const handleDeleteContact = async (item) => {
        const contacts = await deleteContact(item.id);
        dispatch({
            type: "GET-AGENDA",
            payload: contacts
        });
    }

    const handleEditContact = (item) => {
        dispatch({
            type: "EDIT-CONTACT",
            payload: item
        })
        navigate("/contacts/edit-contact");
    }

    const handleImageError = (event) => {
        event.target.src = defaultContactImageError;
    }

    // Render
    return (
        <div className="mt-5">
            <div className="container d-flex justify-content-center">
                <div className="col-8 d-flex justify-content-between">
                    <h3>Contacts</h3>
                    <Link to="/contacts/add-contact">
                        <span>Add Contact</span>
                    </Link>
                </div>
            </div>
            <div className="container d-flex justify-content-center">
                <div className="col-8">
                    {contacts.map(item => {
                        return (
                            <div className="card mb-3" key={item.id}>
                                <div className="row g-0">
                                    <div className="col-md-4 d-flex align-items-center px-3">
                                        <img src={`https://randomuser.me/api/portraits/women/${item.id}.jpg`} className="img-fluid rounded-circle"
                                            onError={handleImageError} />
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card-body">
                                            <h5 className="card-title">{item.name}</h5>
                                            <p className="card-text"><i className="fa-solid fa-envelope pe-2"></i>{item.email}</p>
                                            <p className="card-text"><i className="fa-solid fa-phone pe-2"></i>{item.phone}</p>
                                            <p className="card-text"><i className="fa-solid fa-location-pin pe-2"></i>{item.address}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4 d-flex align-items-center px-3 gap-2 ">
                                        <button onClick={() => handleEditContact(item)} type="button" className="btn btn-secondary mx-3"><i className="fa-solid fa-pen"></i></button>
                                        <button onClick={() => handleDeleteContact(item)} type="button" className="btn btn-danger"><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}