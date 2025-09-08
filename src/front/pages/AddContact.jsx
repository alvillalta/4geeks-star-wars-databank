import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

import { postContact } from "../services/contact-services.js"


export const AddContact = () => {

    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Local state variables
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // Controlled inputs
    const handleName = event => setName(event.target.value);
    const handleEmail = event => setEmail(event.target.value);
    const handlePhone = event => setPhone(event.target.value);
    const handleAddress = event => setAddress(event.target.value);

    const handleSubmitAddContact = async (event) => {
        event.preventDefault();
        const newContact = {
            "name": name,
            "email": email,
            "phone": phone,
            "address": address
        }
        await postContact(newContact);
        navigate("/contacts");
    }

    const handleCancel = () => {
        navigate("/contacts");
    }

    return (
        <div className="my-4">
            <div className="container d-flex justify-content-center">
                <div className="col-8 d-flex justify-content-between">
                    <h3>Add a new contact</h3>
                    <Link to="/contacts" className="text-dark">
                        <span>Back to Contacts</span>
                    </Link>
                </div>
            </div>
            <div className="container d-flex justify-content-center">
                <div className="col-8">
                    <form onSubmit={handleSubmitAddContact}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" className="form-control" id="name" placeholder="Your name here"
                                value={name} onChange={handleName} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" className="form-control" id="email" placeholder="Your email here"
                                value={email} onChange={handleEmail} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input type="text" className="form-control" id="phone" placeholder="Your phone here"
                                value={phone} onChange={handlePhone} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input type="text" className="form-control" id="address" placeholder="Your address here"
                                value={address} onChange={handleAddress} />
                        </div>
                        <div className="py-3 g-3">
                            <button type="submit" className="btn btn-dark mx-3">Submit</button>
                            <button onClick={handleCancel} type="button" className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}