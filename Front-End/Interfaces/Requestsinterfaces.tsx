interface WorkerPrivateRequest {
  workerId : number,
  clientId : number,
  id: number;
  client_username: string;
  category: string;
  media: {
    type: string;
    url: string;
  }[];
  client_profile_image: string;
  client_location: {
    city: string;
    region: string;
    country: string;
  };
  sent_date: string;
  description: string;
  payment_method: string;
  status: string;
}
interface ClientPrivateRequest {
  workerId : number,
  clientId : number,
  id: number;
  status: string;
  worker_username: string;
  worker_profile_image: string;
  sent_date: string;
  category: string;
  description: string;
  media: {
    type: string;
    url: string;
  }[];
  location: {
    city: string;
    region: string;
    country: string;
  };
}
interface WorkerPublicRequest {
  id: number;
  category: string;
  client_username: string;
  client_profile_image: string;
  worker_comment: string;
  comment_date: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  post_date: string;
  description: string;
  media: {
    type: string;
    url: string;
  }[];
  payment_method: string;
  status: string;
}
interface ClientPublicRequest {
  id: number;
  category: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  sent_date: string;
  work_date: string;
  description: string;
  media: {
    type: string;
    url: string;
  }[];
  payment_method: string;
  status: string;
}
export {
  WorkerPrivateRequest,
  WorkerPublicRequest,
  ClientPrivateRequest,
  ClientPublicRequest,
};
