interface User{
    id : number,
    email : string;
    phoneNumber : number;
    username : string;
    password : string;
    role: number;
    sex?:number,
    age?:number,
    profileImage?:string,
    address?:number
}

export default User;