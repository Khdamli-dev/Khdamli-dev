interface JobRequest {
    id: number;
    worker: number | null;
    client: number;
    client_address: number;
    sent_time: Date;
    working_time: Date;
    category: number;
    payment: number;
    description: string;
    type: number;   // 1 for Public, 2 for Private
    status: number; // 3 for "On Hold" on new requests
  }
export default JobRequest;
  