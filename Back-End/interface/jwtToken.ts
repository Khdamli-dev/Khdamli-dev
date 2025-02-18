interface JwtToken{
    userId : string;
    role : string;
    time : number | string;
    secret : string;
}

export default JwtToken;