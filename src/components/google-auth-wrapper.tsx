"use client"

import React from "react";
import {GoogleOAuthProvider} from "@react-oauth/google";

const GoogleAuthWrapper = ({...props}) => {
    return (
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
            {props.children}
        </GoogleOAuthProvider>
    )
}

export default GoogleAuthWrapper
